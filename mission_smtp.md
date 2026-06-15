# Mission — feat/smtp-brevo : confirmation email + notifications transactionnelles

## Contexte
Tu es sur la branche `prototype`. Toutes les phases Scribe (P0 à P5) sont construites et mergees.
La navigation + dashboard-hub viennent d'etre livres sur `feat/capture-audio`.
Snapshot actuel : `prototype` a tout.

## Ce qu'il faut construire
Module SMTP Brevo — le dernier bloc manquant avant production :
- **Confirmation d'email** : envoi d'un email de verification a l'inscription
- **Notifications transactionnelles** : invitation a une org, reset de mot de passe
- **Integration Brevo** (France, 9k/mois gratuits, pas de quota depasse au MVP)
- **Pas de Supabase Auth emails** — on bypass le systeme de mail integre de Supabase pour gerer nous-memes

## Contraintes
- Brevo API : `sib-api-v3-sdk` npm (SendinBlue)
- Variables d'env : `BREVO_API_KEY`, `SENDER_EMAIL` (contact@atelierklar.fr), `SENDER_NAME` (Scribe)
- Mobile-first, design AK (obsidienne #0A0708, ivoire #F0E8D6)
- Pas de secret committe
- Branche : `feat/smtp-brevo` (a creer depuis `prototype`)
- check:rls pas necessaire (pas de tables)

## Etapes
1. Creer la branche `feat/smtp-brevo` depuis `prototype`
2. Installer `sib-api-v3-sdk`
3. Construire `src/lib/email/send.ts` — client Brevo wrap, envoie les 3 templates (verification, invitation, reset)
4. Construire `src/app/api/auth/confirm/route.ts` — endpoint pour renvoyer l'email de confirmation
5. Modifier le flux signup pour declencher l'email de verification
6. Ajouter `BREVO_*` dans `.env.local` (pas les vraies cles, placeholder)
7. npm run lint → propre
8. npm run build → OK
9. Commit + push

## RAPPORT FINAL
- Resume en 3 lignes max
- Liste des fichiers crees/modifies
- Resultat lint + build
