#!/usr/bin/env python3
import json, urllib.request, urllib.parse, os, sys, time, re

SHEET_ID = "1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o"
FIRECRAWL_KEY = open("/opt/data/scribe-app/.firecrawl_key").read().strip()

def get_places_key():
    KEY_PREFIX = "GOOGLE_PLACES_API_KEY=***    for path in [
        os.path.expanduser("~/.hermes/home/.hermes/.env"),
        "/home/hermes/.hermes/home/.hermes/.env",
    ]:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    s = line.strip()
                    if s.startswith(KEY_PREFIX):
                        return s[len(KEY_PREFIX):]
    return ""

def get_oauth_token():
    creds = "/home/hermes/.hermes/cache/documents/doc_b2eb4e881d86_client_secret_956672481731_4sku8hjfkp7jetnf3fegrsjfsmbu1ttf_apps.json"
    tok = "/home/hermes/.hermes/profiles/prospection/home/.config/google-workspace-mcp/tokens.json"
    with open(creds) as f:
        c = json.load(f)["installed"]
    with open(tok) as f:
        r = json.load(f)["refresh_token"]
    data = urllib.parse.urlencode({
        "client_id": c["client_id"],
        "client_secret": c["client_secret"],
        "refresh_token": r,
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["access_token"]

def sheets_read(sheet, token):
    url = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + sheet
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + token})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode()).get("values", [])

def sheets_write(cell, value, token):
    url = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + cell + "?valueInputOption=RAW"
    body = json.dumps({"values": [[value]]}).encode()
    req = urllib.request.Request(url, data=body,
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
        method="PUT")
    with urllib.request.urlopen(req) as resp:
        resp.read()

def places_find(name, address, api_key):
    q = urllib.parse.quote(name + " " + address)
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + q + "&inputtype=textquery&fields=place_id&key=" + api_key + "&language=fr"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        candidates = data.get("candidates", [])
        return candidates[0]["place_id"] if candidates else None
    except:
        return None

def places_website(place_id, api_key):
    url = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + place_id + "&fields=website&key=" + api_key + "&language=fr"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode()).get("result", {})
        return result.get("website", "")
    except:
        return ""

def firecrawl_get_email(site_url, key):
    """Try to extract email from a URL via Firecrawl."""
    try:
        body = json.dumps({"urls": [site_url], "prompt": "Extract all email addresses on this page. Return JSON array."}).encode()
        req = urllib.request.Request("https://api.firecrawl.dev/v1/extract",
            data=body,
            headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        if data.get("success") and data.get("data"):
            raw = str(data["data"])
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', raw)
            return emails[0] if emails else ""
    except Exception as e:
        print("    Firecrawl error: " + str(e)[:100])
    return ""

# --- MAIN ---
api_key = get_places_key()
token = get_oauth_token()
print("Firecrawl: " + str(len(FIRECRAWL_KEY)) + " chars")
print("Places: " + str(len(api_key)) + " chars")
print("OAuth: " + str(len(token)) + " chars")

rows = sheets_read("Leads!A1:H200", token)
leads = rows[1:]
print("Total leads: " + str(len(leads)))

found = 0
for i, row in enumerate(leads):
    name = row[0] if len(row) > 0 else ""
    contact = row[5] if len(row) > 5 else ""
    website = row[3] if len(row) > 3 else ""
    address = row[2] if len(row) > 2 else ""

    if "@" in contact:
        continue

    row_num = i + 2
    print("\n[" + str(row_num) + "/" + str(len(leads)) + "] " + name + "...")

    # Get website if missing
    if not website or "http" not in website:
        pid = places_find(name, address, api_key)
        if pid:
            time.sleep(0.3)
            ws = places_website(pid, api_key)
            if ws:
                sheets_write("Leads!D" + str(row_num), ws, token)
                website = ws
                print("  Website: " + ws)

    # Firecrawl for email
    if website and "http" in website:
        print("  Scraping " + website[:80] + "...")
        email = firecrawl_get_email(website, FIRECRAWL_KEY)
        if email:
            sheets_write("Leads!F" + str(row_num), email, token)
            print("  EMAIL: " + email)
            found += 1
        time.sleep(1.5)

print("\n" + "=" * 60)
print("Done. " + str(found) + " emails found.")
