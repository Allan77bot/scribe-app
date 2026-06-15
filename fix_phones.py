#!/usr/bin/env python3
"""Phase 1: Validate and fix phone numbers in Prospection sheet.
Any cell that looks like a rating ("4.5/5", "Note:", "avis") is replaced
with the real phone number from Google Places API."""
import json, urllib.request, urllib.parse, os, sys, time, re

SHEET_ID = "1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o"
SHEET = "Leads"

# --- Auth ---
def get_places_key():
    for path in [
        os.path.expanduser("~/.hermes/home/.hermes/.env"),
        "/home/hermes/.hermes/home/.hermes/.env",
    ]:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    if line.startswith("GOOGLE_PLACES_API_KEY="):
                        return line.strip().split("=", 1)[1]
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

def api_get(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def api_put(url, body, headers):
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
        headers=headers, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def is_bad_value(val):
    """Return True if value is NOT a valid phone number."""
    if not val:
        return False
    bad_patterns = [
        r"/5\b", r"avis", r"Note:", r"Pas de", r"Non trouv",
        r"^\d+\.?\d*$",  # pure number like "4.5"
    ]
    for pat in bad_patterns:
        if re.search(pat, val, re.IGNORECASE):
            return True
    # Valid phone: contains digits and at least one separator (space, dot, dash)
    digits = re.findall(r"\d", val)
    return len(digits) < 6  # too few digits = probably junk

def find_place(name, address, api_key):
    q = f"{name} {address}"
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={urllib.parse.quote(q)}&inputtype=textquery&fields=place_id&key={api_key}&language=fr"
    try:
        data = api_get(url, {})
        candidates = data.get("candidates", [])
        return candidates[0]["place_id"] if candidates else None
    except:
        return None

def get_details(place_id, api_key):
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=formatted_phone_number,website,rating,user_ratings_total&key={api_key}&language=fr"
    try:
        return api_get(url, {}).get("result", {})
    except:
        return {}

# --- MAIN ---
api_key = get_places_key()
token = get_oauth_token()
headers = {"Authorization": "Bearer " + token, "Content-Type": "application/json"}
print(f"Places key: {len(api_key)} chars | OAuth: {len(token)} chars")

# Read sheet
rows = api_get(
    f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET}!A1:H200",
    {"Authorization": "Bearer " + token}
).get("values", [])

header = rows[0]
leads = rows[1:]
print(f"Total rows: {len(leads)}")

# Scan for bad phones
bad_count = 0
for i, row in enumerate(leads):
    name = row[0] if len(row) > 0 else ""
    phone = row[4] if len(row) > 4 else ""
    addr = row[2] if len(row) > 2 else ""
    
    if not is_bad_value(phone):
        continue
    
    bad_count += 1
    row_num = i + 2
    print(f"\n  [{row_num}] {name}: '{phone}' → BAD, looking up...")
    
    place_id = find_place(name, addr, api_key)
    if not place_id:
        print(f"    -> No place found")
        continue
    
    time.sleep(0.3)
    details = get_details(place_id, api_key)
    real_phone = details.get("formatted_phone_number", "")
    
    if real_phone:
        api_put(
            f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{SHEET}!E{row_num}?valueInputOption=RAW",
            {"values": [[real_phone]]},
            headers
        )
        print(f"    -> Fixed: {real_phone}")
    
    time.sleep(0.2)

print(f"\n✅ Phase 1 done. {bad_count} bad phones found, corrected when possible.")
