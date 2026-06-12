# Briefing Hermes — message Telegram prêt à coller + cartes Board

> Mode d'emploi pour Allan : 1) faire les 3 préparatifs, 2) coller le message
> à Hermes sur Telegram, 3) créer les cartes dans le Board (texte fourni).

## 1. Préparatifs (toi, ~10 min)

- [ ] **PAT GitHub** : github.com → Settings → Developer settings →
      Fine-grained tokens → New. Repository access : **Only select repositories
      → `scribe-app`**. Permissions : **Contents = Read and write**,
      **Pull requests = Read and write**. Rien d'autre. Expiration 90 jours.
- [ ] **Compte Supabase sandbox** : créer (ou réutiliser) un compte Supabase sur
      `contact@atelierklar.fr` → Account → Access Tokens → nouveau PAT.
      ⚠ PAS un token de ton compte perso (il donnerait accès au vrai projet).
- [ ] **Connexion CLI côté VPS** : connecter `gh` avec le PAT fine-grained,
      JAMAIS avec le compte Allan77bot complet (sinon Hermes accède à tous les
      repos, dont le cockpit qui déploie sur Netlify) :
      `echo <PAT> | gh auth login --with-token`

> Protection de `main` : décision Allan 2026-06-12 — pas de GitHub Pro pour
> l'instant. Acceptable car rien ne se déploie depuis `main` de `scribe-app`
> (pas de Vercel branché) : un push accidentel se revert. À reconsidérer dès
> que Vercel sera connecté au repo.

## 2. Message Telegram (coller tel quel, remplacer les <…>)

```
Hermes, nouvelle mission : projet SCRIBE (app SaaS de l'Atelier, indépendante
de la prospection — tes missions actuelles ne changent pas).

Repo : https://github.com/Allan77bot/scribe-app (privé)
PAT GitHub (ce repo uniquement) : <PAT_GITHUB>
PAT Supabase du compte SANDBOX dédié : <PAT_SUPABASE_SANDBOX>

Première chose à faire : cloner le repo et lire HERMES.md à la racine —
c'est ton briefing complet (ton rôle, ton environnement, tes limites).
Puis docs/setup-claude-code-vps.md pour configurer Claude Code.

Règles non négociables (détail dans HERMES.md) :
- jamais de push sur main → branche + PR, toujours ;
- tu travailles UNIQUEMENT sur ton projet Supabase sandbox que tu vas créer ;
- le vrai projet Supabase de Scribe ne te concerne jamais, ne demande pas ses clés ;
- aucun secret commité, nulle part ;
- tes tâches arrivent par le Board (Responsable = Hermes, projet Scribe),
  chaque action = ligne Journal, comme d'habitude.

Quand tu as lu HERMES.md, accuse réception ici avec un résumé en 3 lignes de
ce que tu as compris de ta mission, puis attaque la première carte du Board.
```

## 3. Cartes Board (onglet `Taches`, Projet = `Scribe`, Responsable = `Hermes`)

| # | Titre | Prio | Lien / détail |
|---|---|---|---|
| 1 | Cloner scribe-app, lire HERMES.md, accuser réception sur Telegram | haute | github.com/Allan77bot/scribe-app |
| 2 | Provisionner le projet Supabase `scribe-sandbox` (compte sandbox, région EU) + `.env.local` | haute | docs/setup-claude-code-vps.md §4 |
| 3 | Appliquer les migrations + prouver l'isolation (`test:isolation` 4/4, `check:rls` vert) → rapport Journal | haute | HERMES.md §Ton environnement |
| 4 | Recherche : SMTP transactionnel pour la confirmation e-mail Supabase (comparatif coût/UE/simplicité + reco argumentée) | moyenne | snapshot.md §Décisions ouvertes |
| 5 | Recherche : transcription OpenAI direct vs Azure OpenAI EU (coût, latence, conformité UE + reco) | moyenne | snapshot.md §Décisions ouvertes |

Dans l'onglet `Projets`, ajouter la ligne : `Scribe` · statut `en cours` ·
resp `Allan` · next `Hermes opérationnel sur le sandbox` · desc `App SaaS notes
vocales → coordination d'équipe (repo scribe-app)`.
