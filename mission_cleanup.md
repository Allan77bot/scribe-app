Claude Code mission: Nettoyer la Google Sheet Prospection Atelier Klar

Contexte: /home/hermes/.hermes/scripts/enrich_leads.py fonctionne deja (OAuth + Places API OK).
Tu dois l'AMELIORER et l'EXECUTER.

FIRECRAWL_API_KEY est dans l'environnement du VPS. Verifie-la avec: echo $FIRECRAWL_API_KEY | wc -c

Étapes:
1. Corrige les faux numeros: les valeurs contenant "/5", "avis", "Note:", "stars" NE sont PAS des telephones.
   Remplace-les par le vrai numero via Google Places API.

2. Avec Firecrawl, scrape les sites web des leads pour trouver des emails.
   Methode: pour chaque lead avec un site web, scrape la homepage + /contact via api.firecrawl.dev/v1/scrape.
   Extraire les emails avec regex [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}.
   Ecris le resultat dans la colonne F (Contact).

3. Ajoute les notes Google (etoiles + nombre d'avis) dans la colonne G (Signaux) pour les leads qui n'en ont pas.

4. Resume: combien de telephones corriges, emails trouves, avis ajoutes.

La sheet: ID=1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o, feuille "Leads".
Colonnes: A=Nom B=Type C=Adresse D=Site E=Telephone F=Contact G=Signaux H=Approche

UTILISE --dangerously-skip-permissions. TOUT est autorise. Execute toi-meme le script, ne demande pas de permission.
GO.