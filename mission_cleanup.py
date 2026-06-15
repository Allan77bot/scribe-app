#!/usr/bin/env python3
"""Mission cleanup — Prospection Atelier Klar (sheet "Leads").

3 phases, idempotentes :
  1. Corriger les faux téléphones (valeurs type "/5", "avis", "Note:", "stars")
     -> vrai numéro via Google Places API.
  2. Scraper le site web de chaque lead (homepage + /contact) via Firecrawl
     /v1/scrape, extraire un email par regex -> colonne F (Contact).
  3. Ajouter la note Google (étoiles + nb avis) en colonne G (Signaux) pour les
     leads qui n'en ont pas encore.

Mettre DRY_RUN=1 pour ne RIEN écrire (preview des lignes impactées).
Colonnes : A=Nom B=Type C=Adresse D=Site E=Telephone F=Contact G=Signaux H=Approche
"""
import json, urllib.request, urllib.parse, os, sys, time, re

SHEET_ID = "1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o"
SHEET = "Leads"
DRY_RUN = os.environ.get("DRY_RUN", "") == "1"
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
# domaines à ignorer (faux positifs courants dans le HTML)
EMAIL_BLOCKLIST = ("@example.", "@sentry.", "@2x", "@3x", ".png", ".jpg", ".webp",
                   ".gif", ".svg", "@wordpress", "@email.")

FIRECRAWL_KEY = open("/opt/data/scribe-app/.firecrawl_key").read().strip()


# --- Auth ---------------------------------------------------------------
def get_places_key():
    for path in ("/home/hermes/.hermes/home/.hermes/.env",
                 "/home/hermes/.hermes/.env"):
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    s = line.strip()
                    if s.startswith("GOOGLE_PLACES_API_KEY="):
                        return s.split("=", 1)[1]
    return os.environ.get("GOOGLE_PLACES_API_KEY", "")


def get_oauth_token():
    creds = "/home/hermes/.hermes/cache/documents/doc_b2eb4e881d86_client_secret_956672481731_4sku8hjfkp7jetnf3fegrsjfsmbu1ttf_apps.json"
    tok = "/home/hermes/.hermes/profiles/prospection/home/.config/google-workspace-mcp/tokens.json"
    with open(creds) as f:
        c = json.load(f)["installed"]
    with open(tok) as f:
        r = json.load(f)["refresh_token"]
    data = urllib.parse.urlencode({
        "client_id": c["client_id"], "client_secret": c["client_secret"],
        "refresh_token": r, "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["access_token"]


# --- HTTP helpers -------------------------------------------------------
def http_get(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def http_post(url, body, headers, timeout=60):
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


# --- Sheets -------------------------------------------------------------
def sheets_read(rng, token):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{rng}"
    return http_get(url, {"Authorization": "Bearer " + token}).get("values", [])


def sheets_write(cell, value, token):
    if DRY_RUN:
        print(f"      [DRY_RUN] would write {cell} = {value!r}")
        return
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{cell}?valueInputOption=RAW"
    req = urllib.request.Request(
        url, data=json.dumps({"values": [[value]]}).encode(),
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
        method="PUT")
    with urllib.request.urlopen(req) as resp:
        resp.read()


# --- Places -------------------------------------------------------------
def places_find(name, address, api_key):
    q = urllib.parse.quote(f"{name} {address}")
    url = (f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
           f"?input={q}&inputtype=textquery&fields=place_id&key={api_key}&language=fr")
    try:
        cands = http_get(url).get("candidates", [])
        return cands[0]["place_id"] if cands else None
    except Exception as e:
        print(f"      Places find error: {str(e)[:80]}")
        return None


def places_details(place_id, api_key):
    url = (f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}"
           f"&fields=formatted_phone_number,website,rating,user_ratings_total&key={api_key}&language=fr")
    try:
        return http_get(url).get("result", {})
    except Exception as e:
        print(f"      Places details error: {str(e)[:80]}")
        return {}


# --- Firecrawl ----------------------------------------------------------
def firecrawl_scrape(url, key):
    """Scrape une page -> markdown (ou '')."""
    try:
        data = http_post("https://api.firecrawl.dev/v1/scrape",
                         {"url": url, "formats": ["markdown"], "onlyMainContent": False},
                         {"Authorization": "Bearer " + key, "Content-Type": "application/json"})
        if data.get("success"):
            return data.get("data", {}).get("markdown", "") or ""
    except urllib.error.HTTPError as e:
        print(f"      Firecrawl HTTP {e.code} on {url[:60]}")
    except Exception as e:
        print(f"      Firecrawl error: {str(e)[:80]}")
    return ""


def extract_emails(text):
    """Tous les emails plausibles d'un texte (dédupliqués, ordre conservé)."""
    out, seen = [], set()
    for m in EMAIL_RE.findall(text or ""):
        low = m.lower()
        if any(b in low for b in EMAIL_BLOCKLIST):
            continue
        if low not in seen:
            seen.add(low)
            out.append(m)
    return out


def site_domain(website):
    host = urllib.parse.urlparse(website).netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def pick_best_email(emails, domain):
    """Privilégie un email dont le domaine == celui du site (évite les emails
    d'agences web/prestataires noyés dans le footer). Sinon premier email."""
    if not emails:
        return ""
    if domain:
        for e in emails:
            if e.lower().endswith("@" + domain):
                return e
    return emails[0]


def find_email_on_site(website, key):
    base = website.rstrip("/")
    domain = site_domain(website)
    candidates = [base]
    # /contact (et variantes) si pas déjà une page contact
    if not base.lower().endswith(("/contact", "/contactez-nous", "/contacts")):
        candidates.append(base + "/contact")
    fallback = ""           # 1er email non-domaine vu, gardé en dernier recours
    fallback_src = ""
    for u in candidates:
        md = firecrawl_scrape(u, key)
        emails = extract_emails(md)
        if emails:
            best = pick_best_email(emails, domain)
            if domain and best.lower().endswith("@" + domain):
                return best, u          # match domaine -> on prend direct
            if not fallback:
                fallback, fallback_src = best, u
        time.sleep(1.0)
    return fallback, fallback_src


# --- Phase helpers ------------------------------------------------------
BAD_PHONE_PAT = re.compile(r"/5\b|avis|note\s*:|stars?|étoile|pas de|non trouv", re.IGNORECASE)


def is_bad_phone(val):
    if not val or not val.strip():
        return False
    if BAD_PHONE_PAT.search(val):
        return True
    # un vrai téléphone FR a au moins ~9 chiffres
    return len(re.findall(r"\d", val)) < 8


def has_rating(signaux):
    return bool(signaux) and ("/5" in signaux or "avis" in signaux.lower())


# --- MAIN ---------------------------------------------------------------
def main():
    api_key = get_places_key()
    token = get_oauth_token()
    print(f"Firecrawl: {len(FIRECRAWL_KEY)} chars | Places: {len(api_key)} chars | OAuth: {len(token)} chars")
    print(f"DRY_RUN = {DRY_RUN}\n")

    rows = sheets_read(f"{SHEET}!A1:H300", token)
    if not rows:
        print("Sheet vide ou illisible."); return
    header, leads = rows[0], rows[1:]
    print(f"Header: {header}")
    print(f"{len(leads)} leads\n" + "=" * 60)

    # cache place details par ligne pour ne pas réinterroger Places
    details_cache = {}

    def get_details_for(idx, name, address):
        if idx in details_cache:
            return details_cache[idx]
        pid = places_find(name, address, api_key)
        d = {}
        if pid:
            time.sleep(0.3)
            d = places_details(pid, api_key)
        details_cache[idx] = d
        return d

    n_phones = n_emails = n_ratings = 0

    for i, row in enumerate(leads):
        row_num = i + 2
        name    = row[0] if len(row) > 0 else ""
        address = row[2] if len(row) > 2 else ""
        website = row[3] if len(row) > 3 else ""
        phone   = row[4] if len(row) > 4 else ""
        contact = row[5] if len(row) > 5 else ""
        signaux = row[6] if len(row) > 6 else ""

        if not name.strip():
            continue
        print(f"\n[{row_num}] {name}")

        # ---- Phase 1 : téléphone ----
        if is_bad_phone(phone):
            print(f"  phone '{phone}' -> suspect, lookup Places")
            d = get_details_for(i, name, address)
            real = d.get("formatted_phone_number", "")
            if real:
                sheets_write(f"{SHEET}!E{row_num}", real, token)
                print(f"  ✓ phone corrigé: {real}")
                n_phones += 1
            else:
                print("  · pas de numéro trouvé")

        # ---- Phase 3 : note Google (col G) ----
        if not has_rating(signaux):
            d = get_details_for(i, name, address)
            if d.get("rating"):
                rating = f"{d['rating']}/5 ({d.get('user_ratings_total', 0)} avis)"
                new_sig = (f"{signaux} | Note Google: {rating}".strip(" |")
                           if signaux else f"Note Google: {rating}")
                sheets_write(f"{SHEET}!G{row_num}", new_sig, token)
                print(f"  ✓ note ajoutée: {rating}")
                n_ratings += 1

        # ---- Phase 2 : email via Firecrawl (col F) ----
        if "@" not in contact:
            # récupérer le site si manquant
            if not website or "http" not in website:
                d = get_details_for(i, name, address)
                ws = d.get("website", "")
                if ws:
                    sheets_write(f"{SHEET}!D{row_num}", ws, token)
                    website = ws
                    print(f"  ✓ site trouvé: {ws}")
            if website and "http" in website:
                print(f"  scraping {website[:70]}")
                email, src = find_email_on_site(website, FIRECRAWL_KEY)
                if email:
                    sheets_write(f"{SHEET}!F{row_num}", email, token)
                    print(f"  ✓ EMAIL: {email}  (via {src})")
                    n_emails += 1
                else:
                    print("  · aucun email trouvé")

    print("\n" + "=" * 60)
    print("RÉSUMÉ" + (" (DRY_RUN — rien écrit)" if DRY_RUN else ""))
    print(f"  Téléphones corrigés : {n_phones}")
    print(f"  Emails trouvés      : {n_emails}")
    print(f"  Notes ajoutées      : {n_ratings}")


if __name__ == "__main__":
    main()
