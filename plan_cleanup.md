# Claude Code — cleanup Prospection sheet

Je vais t'écrire le script Python complet a executer. Tu es Claude Code, execute-le.

## Script cleanup_leads.py

```python
import json, urllib.request, urllib.parse, os, re, sys, time

# === CONFIGURATION ===
PROSPECTION_SHEET_ID = "1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o"
SHEET_NAME = "Leads"
# Paths
TOKENS_PATH = "/home/hermes/.hermes/profiles/prospection/home/.config/google-workspace-mcp/tokens.json"
CREDS_PATH = "/home/hermes/.hermes/home/.hermes/cache/documents/doc_b2eb4e881d86_client_secret_956672481731_4sku8hjfkp7jetnf3fegrsjfsmbu1ttf_apps.json"

def get_places_key():
    """Find Places API key from env or .env files."""
    k = os.environ.get("GOOGLE_PLACES_API_KEY", "")
    if k: return k
    for path in [
        os.path.expanduser("~/.hermes/.env"),
        os.path.join(os.environ.get("HERMES_HOME", ""), ".env"),
        "/home/hermes/.hermes/.env",
        "/home/hermes/.hermes/home/.hermes/.env",
    ]:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    if line.startswith("GOOGLE_PLACES_API_KEY="):
                        return line.strip().split("=", 1)[1]
    return ""

def get_firecrawl_key():
    """Find Firecrawl API key from env."""
    return os.environ.get("FIRECRAWL_API_KEY", "")

def get_oauth_token():
    """Get OAuth access token for Sheets API."""
    if not os.path.exists(CREDS_PATH):
        raise FileNotFoundError(f"Credentials not found: {CREDS_PATH}")
    if not os.path.exists(TOKENS_PATH):
        raise FileNotFoundError(f"Tokens not found: {TOKENS_PATH}")
    
    with open(CREDS_PATH) as f:
        installed = json.load(f)["installed"]
    with open(TOKENS_PATH) as f:
        refresh = json.load(f)["refresh_token"]
    
    data = urllib.parse.urlencode({
        "client_id": installed["client_id"],
        "client_secret": installed["client_secret"],
        "refresh_token": refresh,
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["access_token"]

def places_find_place(name, address, api_key):
    """Search for a place by name+address, return place_id."""
    query = f"{name} {address}"
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={urllib.parse.quote(query)}&inputtype=textquery&fields=place_id&key={api_key}&language=fr"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    candidates = data.get("candidates", [])
    return candidates[0]["place_id"] if candidates else None

def places_get_details(place_id, api_key):
    """Get place details: phone, website, rating, reviews."""
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=formatted_phone_number,website,rating,user_ratings_total,reviews&key={api_key}&language=fr&reviews_no_translation=true"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    return data.get("result", {})

def read_sheet(sheet_id, range_spec, token):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{range_spec}"
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + token})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode()).get("values", [])

def update_cell(sheet_id, cell, value, token):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{cell}?valueInputOption=RAW"
    body = json.dumps({"values": [[value]]}).encode()
    req = urllib.request.Request(url, data=body,
        headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
        method="PUT")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def is_valid_phone(value):
    """Check if value looks like a real phone number."""
    if not value or value.lower() == "non trouve":
        return False
    # Reject values that are clearly ratings/reviews
    bad_patterns = ["/5", "avis", "note:", "rated", "stars", "review"]
    val_lower = value.lower()
    for p in bad_patterns:
        if p in val_lower:
            return False
    # Must contain digits
    if not re.search(r'\d', value):
        return False
    # French phone format: 0X XX XX XX XX or +33 or 0X.XX.XX.XX.XX
    return True

def is_valid_website(value):
    """Check if value looks like a URL."""
    if not value:
        return False
    return value.startswith("http") or ".com" in value or ".fr" in value or ".co" in value

def search_email_via_firecrawl(website, name, fc_key):
    """Use Firecrawl to scrape a website and find contact email."""
    if not fc_key or not website:
        return None
    
    try:
        # First, try to scrape the homepage
        url = "https://api.firecrawl.dev/v1/scrape"
        body = json.dumps({
            "url": website,
            "formats": ["markdown"],
            "onlyMainContent": True,
        }).encode()
        req = urllib.request.Request(url, data=body,
            headers={
                "Authorization": "Bearer " + fc_key,
                "Content-Type": "application/json",
            })
        req = urllib.request.Request(url, data=body,
            headers={
                "Authorization": "Bearer " + fc_key,
                "Content-Type": "application/json",
            })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        
        text = data.get("data", {}).get("markdown", "")
        if text:
            # Extract emails from markdown
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            if emails:
                # Filter out common false positives
                filtered = [e for e in emails if not e.endswith(('.png', '.jpg', '.svg', '.gif', '.example.com')) 
                           and not e.startswith('example')]
                if filtered:
                    return filtered[0]
        
        # Try /contact or /nous-contacter if no email found
        contact_urls = [
            website.rstrip('/') + '/contact',
            website.rstrip('/') + '/nous-contacter',
            website.rstrip('/') + '/contactez-nous',
        ]
        for contact_url in contact_urls:
            try:
                body2 = json.dumps({
                    "url": contact_url,
                    "formats": ["markdown"],
                    "onlyMainContent": True,
                }).encode()
                req2 = urllib.request.Request(contact_url, data=body2,
                    headers={
                        "Authorization": "Bearer " + fc_key,
                        "Content-Type": "application/json",
                    })
                with urllib.request.urlopen(req2, timeout=10) as resp:
                    data2 = json.loads(resp.read().decode())
                text2 = data2.get("data", {}).get("markdown", "")
                if text2:
                    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text2)
                    if emails:
                        return emails[0]
            except:
                continue
    except Exception as e:
        print(f"  Firecrawl error for {website}: {str(e)[:80]}")
    
    return None

def main():
    # === ÉTAPE 0: Auth ===
    api_key = get_places_key()
    fc_key = get_firecrawl_key()
    print(f"Places key: {'OK' if api_key else 'MISSING'} ({len(api_key)} chars)" if api_key else "Places key: MISSING")
    print(f"Firecrawl key: {'OK' if fc_key else 'MISSING'} ({len(fc_key)} chars)" if fc_key else "Firecrawl key: MISSING")
    
    if not api_key:
        print("FATAL: No Places API key")
        sys.exit(1)
    
    token = get_oauth_token()
    print(f"OAuth: OK ({len(token)} chars)")
    
    # === Read all leads ===
    rows = read_sheet(PROSPECTION_SHEET_ID, f"{SHEET_NAME}!A1:H200", token)
    header = rows[0]
    leads = rows[1:]
    print(f"Leads: {len(leads)}")
    
    fixed_phones = 0
    added_websites = 0
    added_emails = 0
    added_ratings = 0
    refreshed = 0
    
    for i, row in enumerate(leads):
        if i == 0:
            continue  # skip example
        
        name = row[0] if len(row) > 0 else ""
        address = row[2] if len(row) > 2 else ""
        current_phone = row[4] if len(row) > 4 else ""
        current_website = row[3] if len(row) > 3 else ""
        current_contact = row[5] if len(row) > 5 else ""
        current_signals = row[6] if len(row) > 6 else ""
        
        if not name:
            continue
        
        phone_invalid = current_phone and not is_valid_phone(current_phone)
        no_contact = not current_contact or current_contact.lower() == "non trouve"
        needs_rating = "Note:" not in current_signals
        
        if not (phone_invalid or no_contact or needs_rating):
            continue
        
        print(f"\n[{i+1}/{len(leads)}] {name[:40]}")
        
        try:
            place_id = places_find_place(name, address, api_key)
            if not place_id:
                print(f"  -> Place not found")
                continue
            
            time.sleep(0.3)
            details = places_get_details(place_id, api_key)
            row_num = i + 2  # 1-indexed + header
            updated = False
            
            # ETAPE 1: Fix invalid phone
            if phone_invalid and details.get("formatted_phone_number"):
                new_phone = details["formatted_phone_number"]
                update_cell(PROSPECTION_SHEET_ID, f"{SHEET_NAME}!E{row_num}", new_phone, token)
                print(f"  Phone fixed: '{current_phone[:30]}' -> '{new_phone}'")
                fixed_phones += 1
                time.sleep(0.2)
                updated = True
            
            # ETAPE 3: Add rating if missing
            if needs_rating and details.get("rating"):
                rating_str = f"Note: {details['rating']}/5 ({details.get('user_ratings_total', 0)} avis)"
                new_signals = current_signals + " | " + rating_str if current_signals else rating_str
                update_cell(PROSPECTION_SHEET_ID, f"{SHEET_NAME}!G{row_num}", new_signals, token)
                print(f"  Rating added: {rating_str}")
                added_ratings += 1
                time.sleep(0.2)
                updated = True
            
            # ETAPE 2: Find email via Firecrawl (if available and no contact)
            if fc_key and no_contact and details.get("website"):
                print(f"  Searching email via Firecrawl on {details['website']}...")
                email = search_email_via_firecrawl(details["website"], name, fc_key)
                if email:
                    update_cell(PROSPECTION_SHEET_ID, f"{SHEET_NAME}!F{row_num}", email, token)
                    print(f"  Email found: {email}")
                    added_emails += 1
                    time.sleep(0.2)
                else:
                    print(f"  No email found")
            
            time.sleep(0.2)
            
        except Exception as e:
            print(f"  Error: {e}")
    
    print(f"\n=== SUMMARY ===")
    print(f"Phones fixed: {fixed_phones}")
    print(f"Ratings added: {added_ratings}")
    print(f"Emails found: {added_emails}")
    print(f"DONE")

if __name__ == "__main__":
    main()
```

Execute ce script pour nettoyer la sheet Prospection. Resume les resultats a la fin.
