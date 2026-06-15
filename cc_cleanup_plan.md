# Plan d'action Claude Code — Cleanup Prospection Sheet
# =============================================================

# Étape 1 : Valider/Corriger les numéros de téléphone
# ---------------------------------------------------
# Dans le Sheet Prospection (ID: 1a1obdvAAbWU0u3yzVeqnM5vNMjwTmJ4nlhzd1lEXs1o, feuille Leads),
# la colonne E (Téléphone) contient des valeurs. Certaines sont des notes/ratings au lieu de numéros.
# 
# RÈGLES phone valide :
# - Doit contenir au moins 10 chiffres
# - Formats acceptés : +33..., 0..., 01..., 09..., etc.
# - Si la cellule contient "Note:" ou "avis" OU si c'est un nombre à virgule → INVALIDE
# - Si INVALIDE : vider la cellule ou chercher via Places API
#
# Pour chaque lead où phone est absent ou invalide :
#   1. Chercher le place_id via findplacefromtext (Google Places API, clé dans /home/hermes/.hermes/home/.hermes/.env)
#   2. Récupérer formatted_phone_number via Place Details
#   3. Écrire dans la cellule E correspondante
#
# Important : N'écrase JAMAIS un numéro valide.

# Étape 2 : Trouver les emails manquants (PRIORITÉ)
# -------------------------------------------------
# Pour chaque lead où la colonne F (Contact/email) est vide ou "Non trouvé" :
#   1. Visiter le site web du lead (colonne D) avec Firecrawl /scrape
#   2. Extraire les emails visibles sur la page (regex: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})
#   3. Si pas trouvé sur le site, chercher sur Google Maps (Place Details n'a pas d'email) 
#      → utiliser Firecrawl pour scraper la page Maps du commerce
#   4. Écrire l'email trouvé dans la colonne F
#
# API Firecrawl : POST https://api.firecrawl.dev/v1/scrape
#   Header: Authorization: Bearer <FIRECRAWL_API_KEY>
#   Body: {"url": "<site_web>", "formats": ["markdown"]}
#
# RATE LIMIT : 1 requête/seconde max. Respecter.

# Étape 3 : Résumé
# ----------------
# À la fin, afficher un tableau récapitulatif :
#   - Téléphones corrigés : N
#   - Emails trouvés : N  
#   - Leads encore sans email : N
