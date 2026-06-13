## 2026-06-13 — Phase 2 Pipeline IA — feat/pipeline

### Ajouté
- `src/lib/pipeline/actions.ts` — server action `processEntry` :
  - Télécharge le fichier audio depuis le bucket privé `audio-uploads` (client admin service_role)
  - Transcription via **OpenAI Whisper** (`whisper-1`)
  - Extraction de tâches JSON via **Claude Haiku** (`claude-3-haiku-20240307`)
  - Met à jour `entries` : `transcript` + `extracted_tasks_json` + `processed_at`
- `src/lib/entries/actions.ts` — server action `createEntry` :
  - Insère l'entrée (org_id RLS via client anon)
  - Si `type=audio` → appelle `processEntry` avant le redirect

### Vérifications
- `npm run build` → ✅ compilé sans erreur TypeScript
- `npm run check:rls` → ✅ vert (entries : RLS ON, 4 policies, org_id ✓)

### Décisions
- `processEntry` toujours via client admin (service_role) — jamais exposé côté client
- Jamais le modèle haut de gamme pour extraction — Haiku seul (règle d'or n°5)
- Erreur pipeline = log console + pas de crash, l'entrée existe déjà

---

## 2026-06-13 — Recherches SMTP + Transcription tranchées

### Ajouté
- Recherche SMTP transactionnel → **Brevo (Sendinblue)** recommandé 🇫🇷
  - Serveurs Paris, 9k/mois gratuits, intégration Supabase en 2 min
- Recherche transcription → **OpenAI Whisper API direct** pour le MVP
  - Coût : ~1,80€/mois pour 5h audio
  - Azure OpenAI EU = backup si RGPD client
  - Whisper local = trop lourd pour le MVP
- Snapshot.md mis à jour section Décisions + Fait
- Cartes Board SMTP + Transcription marquées "Fait"

## 2026-06-13 — Mission prototype Scribe : grosse construction lancée

### Ajouté
- Spec mission lue : 6 phases (coquille → capture → pipeline IA → tâches → rapport → billing)
- Branche `prototype` créée depuis `main` (avec push origin — déjà existante, mergée à jour)
- Canevas mission enregistré : docs/superpowers/specs/2026-06-13-prototype-app-complete-hermes-design.md
- Cartes Board créées : 7 tâches (branche prototype + 6 phases)
- En attente : procédure de connexion Claude Code (Allan envoie)

### Décisions
- Toute PR → `prototype`, JAMAIS `main`
- Sans clés IA : phases P0-P1 faisables (coquille UI + capture storage)
- Claude Code piloté par Hermes pour chaque phase (mode plan d'abord)

## 2026-06-13 — Hermes opérationnel sur le sandbox Scribe

### Ajouté
- Clonage du repo scribe-app sur le VPS Hermes (/opt/data/scribe-app)
- gh auth avec PAT classique ADMIN (compte Allan77bot)
- .env.local sandbox configuré (URL, anon key, service_role, DB password, project ref)
- Sandbox Supabase doorjfxqetoawqnvguvz (rename → scribe-sandbox)
- npm install réussi (384 packages)
- db:apply — migrations déjà à jour (0001 + 0002)
- test:isolation 4/4 passés OK
- check:rls vert
- Claude Code CLI authentifié (morjonallan@gmail.com)

## 2026-06-13 — Sandbox Supabase provisionné + isolation 4/4

### Ajouté
- Mise en place du sandbox Supabase sur le projet doorjfxqetoawqnvguvz (anonyme, renommé scribe-sandbox)
- Migration 003 : RLS policies, triggers org auto-création, index plein-texte
- Migration 004 : index sur subscriptions::org_status et idx organizations nom/trgm
- npm install exécuté (384 packages)
- .env.local généré avec les clés sandbox + mot de passe DB

### Testé
- ✅ Isolation : trigger crée bien une org + profil admin par inscrit
- ✅ Isolation : org A ne voit QUE ses propres lignes
- ✅ Isolation : org A ne peut PAS lire l'org B, même en ciblant son id
- ✅ Isolation : le trigger IGNORE un invite_org_id injecté (anti-fuite)
- Résultat final : **4/4 pass**

### Infrastructure
- gh auth OK (token classique scope total)
- PR #1 mergée sur main (chore/sandbox-provisioning)
- Veille Tech recâblée sur morjonallan@gmail.com

### Décisions
- Sandbox = projet Supabase existant sur le compte contact@atelierklar.fr
- DB password récupéré de la console Supabase (Allan)
- Modèle deepseek-v4-flash pour Veille Tech (fin des Broken pipe)

---

# Historique — journal du projet

> Journal **daté et append-only** : on ajoute en haut, on ne réécrit jamais le
> passé. C'est la mémoire et l'audit du projet. Pour l'état présent →
> voir `snapshot.md`.

Format d'une entrée :
```
## AAAA-MM-JJ — Titre court
- **Décisions :** …
- **Fait :** …
- **Ouvert :** …
```

---

## 2026-06-13 — `main` rattrape tout le projet (fusion fast-forward)

- **Contexte :** Hermes ne voyait pas `HERMES.md` ni les docs d'intégration — ils
  n'existaient que sur `feat/integration-hermes`, jamais mergés. `main` était resté à
  la fondation documentaire (zéro code), donc invisible depuis la branche par défaut.
- **Décision (Allan) :** **merge direct** plutôt que PR — l'option la plus propre pour
  qu'Hermes voie tout sur la branche par défaut. Validée en connaissance de cause : la
  branche embarque **tout le projet** (auth + sécurité + migrations + CI + docs), pas
  seulement les docs Hermes (les commits Hermes sont empilés sur `feat/auth`).
- **Fait :**
  - **Fusion fast-forward** `feat/integration-hermes` → `main` (14 commits, ~9 300
    lignes), poussée sur `origin/main`. Pas de divergence → historique préservé, aucun
    commit de merge.
  - `tests/projethermes.md` (briefing portable Atelier Klar) commité et inclus — repo
    privé, **aucun secret dedans** (vérifié) ; ne contient que des IDs de Sheets.
  - `HERMES.md`, `docs/briefing-hermes-telegram.md`, la spec d'intégration et le socle
    `feat/auth` sont désormais sur `main` → visibles par Hermes.
- **Conséquence assumée :** la **PR croisée `feat/auth`** (revue du schéma par Alphime)
  prévue avant merge n'a pas eu lieu → la relecture se fera **post-merge** sur `main`.
- **Ouvert :** activation d'Hermes inchangée (PAT GitHub fine-grained + Supabase sandbox
  + briefing Telegram). `gh` absent du poste d'Allan → à installer si on veut des PR en
  CLI à l'avenir.

## 2026-06-12 — Hermes rejoint Scribe + repo poussé sur GitHub

- **Décisions :**
  - **Hermes (agent autonome Atelier Klar, VPS) intègre Scribe** en bac à sable :
    spec validée par Allan → `docs/superpowers/specs/2026-06-12-integration-hermes-design.md`.
    Partage des rôles : Hermes = annexe/sandbox par PR ; Claude (poste Allan) =
    cœur base/RLS ; Alphime = front ; Allan valide et merge.
  - **Claude Code installé sur le VPS** (Fable 5) servira d'exécutant code à
    Hermes en mode bypass — acceptable uniquement car : sandbox total (compte
    Supabase dédié, jamais les clés EU), main par PR, CI obligatoire.
  - **Push GitHub validé par Allan** : repo privé `Allan77bot/scribe-app`.
  - Pilotage d'Hermes par le **Board Atelier Klar** (projet `Scribe`, Journal).
- **Fait :**
  - Repo poussé : `main`, `feat/auth`, `feat/integration-hermes`.
  - **CI GitHub Actions sans secret** (lint + build + migrations + `check:rls`
    contre conteneur `supabase/postgres` jetable) — chaîne testée verte en local ;
    scripts pg tolèrent `sslmode=disable` pour ça.
  - `HERMES.md` (briefing agent + mur déterministe), `docs/setup-claude-code-vps.md`,
    `docs/briefing-hermes-telegram.md` (message + 5 cartes Board + checklist Allan).
  - Cockpit `atelierklar-board` : 3e login **Hermes** (♣ vert) déployé sur Netlify.
  - Brief inter-sessions écrit : `AtelierKlar/Structuration/brief-scribe-hermes-2026-06-12.md`.
- **Ouvert :**
  - **Protection de `main` impossible en plan GitHub Free** (repo privé) →
    décision Allan : GitHub Pro (~4 $/mois) recommandé AVANT de donner le PAT à Hermes.
  - Allan : créer PAT GitHub fine-grained + compte Supabase sandbox, puis coller
    le briefing Telegram. PR croisée `feat/auth` (Alphime) désormais possible sur GitHub.

## 2026-06-10 — Supabase Security Advisor : Critical résolu + durcissement (6 → 3)

- **Déclencheur :** Allan repère dans le dashboard l'alerte **Critical** « RLS Disabled
  in Public » sur `public._scribe_migrations` (le carnet de suivi des migrations).
- **Fait :**
  - **RLS activée** sur `_scribe_migrations` (sans policy → verrouillée, inaccessible via
    l'API). Corrigé sur la base live + dans les scripts (`db-apply`/`provision` créent la
    table avec RLS) + `check-rls` durci (échoue désormais si **une** table `public` a la
    RLS désactivée, comme l'advisor).
  - **Migration `0002`** : droits `EXECUTE` restreints. `handle_new_user` verrouillée
    (trigger-only, aucun accès API) ; `current_org_id` retirée à `anon`, gardée pour
    `authenticated` (requis par la RLS). → 4 WARN « fonctions » résolues.
  - Advisor : **6 → 3 alertes**.
- **Restant (assumé, non bloquant) :**
  - INFO `rls_enabled_no_policy` sur `_scribe_migrations` (verrouillage volontaire).
  - WARN `current_org_id` exécutable par `authenticated` : **inhérent à la RLS** (la
    fonction est sûre, elle ne renvoie que l'org de l'appelant). Non éliminable sans
    casser l'isolation.
  - WARN `auth_leaked_password_protection` (vérif mots de passe fuités / HIBP) :
    **fonctionnalité payante** (plan Pro), indisponible en gratuit (HTTP 402).

## 2026-06-10 — `feat/auth` vérifié EN RÉEL : projet Supabase EU + isolation prouvée

- **Fait :**
  - **Projet Supabase provisionné** via l'API de gestion (`npm run setup:supabase`) :
    org **Atelier Klar**, projet **scribe**, région **eu-central-1 (Frankfurt)**, plan
    free, ref `kgbxxzujlubflsvprmef`. (Création depuis un Personal Access Token fourni
    par Allan — aucun lien GitHub requis.)
  - **Migration `0001` appliquée** via l'endpoint `/database/query` (pas de connexion
    Postgres directe → pas de souci IPv4/pooler).
  - **Test d'isolation : 4/4 PASS en réel** (org A ne voit rien d'org B ; `invite_org_id`
    injecté ignoré). **Critère de mise en prod du brief §8 satisfait.**
  - **`check:rls` vert** ; bug de comptage cartésien des policies corrigé (`count distinct`).
  - **Proxy** protège `/dashboard` avec les vraies clés (307 → `/login`) ; `/` et `/login`
    en 200.
- **Décision (phase de test, réversible) :**
  - **Auto-confirmation e-mail activée** (`mailer_autoconfirm = true`) pour rendre
    l'app utilisable sans SMTP. **À revisiter avant prod** : réactiver la confirmation
    + configurer un SMTP (ou garder OFF si on assume une vérif côté invitation).
- **Sécurité :**
  - `.env.local` (clés réelles : anon, service_role, db_url, **access token**) **gitignoré**,
    jamais commité (vérifié).
  - **Personal Access Token à révoquer** maintenant que le setup est fait (ou à garder
    si on veut reprovisionner / changer la config auth plus tard).

## 2026-06-10 — Audit de sécurité adversarial de `feat/auth` + corrections

- **Fait :**
  - **Revue multi-agents** (4 lentilles indépendantes : isolation RLS, auth/session,
    secrets, correctness → puis vérification sceptique de chaque trouvaille).
    22 trouvailles, **12 confirmées**, corrigées dans la foulée.
  - **CRITIQUE corrigée (isolation)** : le trigger `handle_new_user` honorait un
    `invite_org_id` venu du client (`raw_user_meta_data`, clé anon publique) → via un
    `signUp` direct, n'importe qui pouvait **rejoindre n'importe quelle org**. Branche
    d'invitation **retirée** : chaque inscrit crée SA propre org. Les invitations
    reviendront via un **système à jeton signé** (table `invitations` : token + email +
    expiration) en `feat/invites`. Nom d'org tronqué à 120 côté trigger en défense.
  - **HAUTE (auth)** : le `proxy` désactivait silencieusement la protection des routes
    si les variables d'env manquaient → **bypass en DEV uniquement, échec fort en prod**.
  - **HAUTE (auth)** : le dashboard ignorait l'erreur de `.single()` (profil null →
    rendu dégradé silencieux) → `maybeSingle()` + **UI d'erreur claire** (pas de redirect,
    pour éviter une boucle avec le proxy).
  - **HAUTE (auth)** : messages d'erreur Supabase exposés en clair (énumération de
    comptes) → **messages génériques** côté client, vrai message loggé côté serveur.
  - **MEDIUM** : `maxLength` sur `org_name`/`display_name` côté client.
  - **Test de non-régression** ajouté : un `invite_org_id` injecté est ignoré.
- **Constats positifs de l'audit :**
  - Aucune fuite de `service_role` côté client (uniquement `scripts/` + `tests/`).
  - RLS bien activée + policies `org_id` sur les deux tables ; `current_org_id()`
    SECURITY DEFINER sans récursion.
- **Reporté (hors scope socle, noté pour plus tard) :**
  - Table d'audit des entrées/sorties d'org (compliance) → quand on durcira.
  - Types Supabase générés (`supabase gen types`) pour retirer le cast du dashboard
    → une fois la base en ligne.

## 2026-06-10 — `feat/auth` codé : socle d'isolation (Next.js + Supabase + RLS)

- **Fait :**
  - **Repo git initialisé** localement (le dossier n'était pas versionné). Fondation
    doc commitée sur `main`, dev sur branche `feat/auth`. Pas de push (en attente d'accord).
  - **Squelette Next.js 16** (App Router, TS, Tailwind v4, `src/`) à la racine, docs
    préservés. PWA installable (manifest + icônes reprises de `legacy/`). Mobile-first
    strict (`overflow-x:hidden`, viewport verrouillé).
  - **Migration `supabase/migrations/0001_init_auth.sql`** : tables `organizations` +
    `users` (colonnes EN, brief §5 + `retention_days`), enums `org_plan`/`user_role`,
    `current_org_id()` en **SECURITY DEFINER** (clé anti-récursion RLS), **trigger**
    `handle_new_user` qui crée l'org + le profil admin à l'inscription, **RLS + policies
    `org_id`** sur les deux tables.
  - **Auth sessions Supabase** (`@supabase/ssr`) : clients browser/server + `proxy.ts`
    (Next 16 a renommé `middleware`→`proxy`) qui rafraîchit la session et protège
    `/dashboard`. Jamais de token statique, jamais de `service_role` côté client.
  - **Flux complet** : landing → inscription (crée l'équipe) → login → dashboard
    (plan/quota/rétention/rôle) → logout. Copy FR voix active.
  - **Garde-fous règle d'or n°2 rendus mécaniques** : commandes `/nouvelle-table` et
    `/check-rls`, script d'audit RLS (`npm run check:rls`), checklist pré-commit dans
    `CLAUDE.md`.
  - **Outillage migrations/tests sans friction** : `npm run db:apply` (connexion
    Postgres directe, aucun token d'accès Supabase requis) et `npm run test:isolation`
    (prouve qu'org A ne lit rien d'org B — critère de mise en prod, brief §8).
  - **Vérifié localement** : build OK, lint OK, pages publiques rendues, harnais de
    test opérationnel (s'ignore proprement tant que les clés manquent).
- **Décisions :**
  - Code de l'app **à la racine** du dossier (le `.gitignore` l'anticipait déjà) ；
    pas de sous-projet séparé. `.gitattributes` ajouté (LF normalisés).
  - Application des migrations **par script `pg`** plutôt que CLI Supabase (`supabase`
    et `psql` absents de la machine ; Docker présent mais inutile pour pousser en distant).
- **Ouvert / bloquant pour finir `feat/auth` :**
  - **Allan fournit les accès Supabase EU** (URL, anon, service_role, `SUPABASE_DB_URL`)
    dans `.env.local` → puis `npm run db:apply` et `npm run test:isolation`.
  - Validation du schéma par Alphime (prérequis #2) au moment de la PR croisée.
  - Hook SessionStart (plan §3) volontairement **différé** (risque de faux positifs) ;
    les commandes `/check-rls` + checklist couvrent l'essentiel pour l'instant.



- **Décisions :**
  - **Allan = back-end** : base de données, RLS, fonctionnalités, pipeline IA, dev
    appli (délègue le code à Claude Code). **Alphime = front** : design, UX/UI,
    intégration des fonctionnalités, facilité de navigation.
    (Inverse la répartition provisoire notée le 2026-06-09.)
  - **Workflow en 2 temps** validé : Allan pose le socle back-end → Alph relit/juge →
    Allan adapte → Alph enchaîne sur le front. **Optimisation** : figer le modèle de
    données + le contrat d'API tôt et ensemble, pour que le front démarre **en
    parallèle** contre le contrat plutôt qu'en attente (cascade pure).

## 2026-06-10 — Route IA confirmée + analyse concurrentielle + modèle de coût

- **Décisions :**
  - **Route IA = API Anthropic directe, confirmée comme non bloquante.** Le DPA est
    inclus automatiquement à l'acceptation des conditions commerciales ; no-training
    par défaut sur l'API ; rétention 30j par défaut ; transfert UE couvert par les SCC.
    **Zéro investissement de départ** (paiement à l'usage). ZDR = option à demander
    plus tard si exigé par un client, pas au MVP.
  - **Stack modèle confirmée** : transcription OpenAI mini, extraction **Claude Haiku
    4.5** (le moins cher, ~1 $/5 $ par M tokens), synthèse **Claude Sonnet 4.6** (1×/jour).
  - **OpenRouter + DeepSeek écartés explicitement** : route les données hors UE,
    fournisseur chinois sans adéquation RGPD, conditions d'entraînement floues.
    Mentionner l'IA dans les mentions légales ne suffit PAS à rendre un modèle non
    conforme légal — chaque sous-traitant doit avoir DPA + no-training + transfert encadré.
  - **Rétention = variable selon le plan** (durée courte incluse, plus longue en payant).
  - **Résidence Supabase EU assumée comme différenciateur** : l'analyse concurrentielle
    (Plaud, Fathom, Otter, Fireflies) montre qu'ils stockent tous aux **US** et se
    couvrent par Data Privacy Framework / SCC — personne ne fait de vraie résidence UE.
    Fathom utilise d'ailleurs Anthropic/OpenAI/Google en sous-traitants no-training :
    notre route IA = standard du marché.
- **Ouvert :**
  - Intégrations CRM/Airtable/Sheets/Notion : phase 2 (export) vs MVP — à décider à trois.
  - Transcription : OpenAI direct vs Azure OpenAI EU — avant `feat/pipeline`.

## 2026-06-10 — Blocages tranchés : route IA, hébergement, Hermes

- **Décisions (confirmées avec Allan) :**
  - **Route IA conforme = API Anthropic directe + DPA + résidence EU /
    zéro-rétention** (compte déjà possédé). Remplace le choix Bedrock du 2026-06-09.
    AWS Bedrock EU reste une **cible future** si un client exige strictement AWS.
  - **Hébergement front = Vercel** (natif Next.js). Netlify écarté.
  - **Hermes = outil d'orga interne de l'équipe** (coordination), **sans rapport
    avec le produit Scribe** → pas de doublon avec le futur gestionnaire de tâches.
    On l'ignore côté produit.
- **Conséquence :** plus aucun blocage ouvert pour démarrer le socle `feat/auth`
  (auth + organisations + RLS, Supabase, projet à créer de zéro).
- **Ouvert :**
  - Créer le projet Supabase (région EU) + récupérer URL/clés avant d'appliquer
    les migrations.
  - Signer le DPA Anthropic + activer résidence EU/zéro-rétention avant `feat/pipeline`.

## 2026-06-09 — Stack technique tranchée + organisation à 2

- **Décisions (confirmées avec Allan) :**
  - Stack : Next.js + Vercel/Netlify, Supabase (Postgres/Auth/RLS + Storage EU,
    URL signées), transcription OpenAI mini, extraction Claude Haiku 4.5,
    synthèse Claude Sonnet 4.6. Détail → `docs/stack-technique.md`.
  - **Route IA conforme = Claude via AWS Bedrock EU** (remplace OpenRouter).
  - n8n gardé au début, puis logique rapatriée dans le code (Edge Functions).
  - Comptes déjà possédés : Supabase, Vercel/Netlify, IA (OpenAI/Anthropic/Azure).
  - **Équipe : 2 devs qui codent tous les deux** → répartition par domaine
    (Allan front/design, binôme auth/backend/pipeline), PRs croisées.
- **Ouvert :**
  - Compte AWS pour Bedrock (sinon API Anthropic directe + DPA EU).
  - Vercel vs Netlify.
  - Rôle de « Hermes » / du dashboard d'orga (risque doublon avec le
    gestionnaire de tâches de Scribe) — à clarifier avec Allan.

## 2026-06-09 — Analyse du prototype legacy

- **Fait :**
  - Prototype complet déposé dans `legacy/` (app HTML PWA, 3 workflows n8n,
    prompts, template email, schéma Sheets, seeds).
  - Analyse détaillée écrite dans `docs/analyse-legacy.md`.
- **Décisions / constats :**
  - **IP confirmée et conservée** : prompts WF1 (extraction), WF2 (récap avec
    comparaison à la mémoire), WF3 (MAJ mémoire contrôlée), template email,
    flux UX push-to-talk, logique de validation par proposition.
  - La **stack IA hybride du brief est déjà respectée** par le prototype :
    gpt-5-mini pour extraire, claude-sonnet-4.5 pour la synthèse du soir.
  - **Anti-patterns à corriger** (brief §8) : `secret_token` en localStorage,
    POST audio direct au webhook, aucun `org_id`, données en Google Sheets,
    contexte client en dur dans les prompts, routage via OpenRouter.
  - **Manquent (à construire)** : auth/org/RLS, gestionnaire de tâches, timers,
    anti-collision, accusé de lecture, rapport de passation, quotas/Stripe, purge.
- **Ouvert :**
  - Trancher infra avec Allan : Supabase, storage UE, Azure OpenAI EU vs OpenRouter.
  - Prochaine branche de dev : `feat/auth` (socle isolation).

## 2026-06-09 — Mise en place de l'architecture documentaire

- **Décisions :**
  - Adoption d'une architecture doc en **index slim** : `CLAUDE.md` ne contient
    que la mission, les règles d'or et des pointeurs ; le détail reste dans
    `docs/brief-produit.md` (spec canonique, anciennement
    `scribe-ia-brief-claude-code.md`).
  - Séparation nette des rôles : **snapshot = présent mutable**,
    **historique = passé immuable**, **brief = spec stable**.
  - **Workflow Git** : une préoccupation = une branche = une PR. Claude crée une
    nouvelle branche à chaque init si le concern change (design, login, etc.).
  - **Cible** : projet conçu **B-ready** (équipes en relais) ; validation
    initiale via testeurs profil A ; couche différenciante B en priorité 2.
    (Décision révisable, suivie dans `snapshot.md`.)
- **Fait :**
  - Création de `CLAUDE.md`, `snapshot.md`, `historique.md`.
  - Déplacement du brief dans `docs/brief-produit.md`.
- **Ouvert :**
  - Récupérer le prototype existant (HTML push-to-talk + workflows n8n) dans
    `legacy/` pour analyse → prochaine étape.
  - Confirmer les stacks déjà possédées par l'équipe avant de coder l'infra.

## 2026-06-12 — Sandbox scribe opérationnel

✅ **Provisioning sandbox Supabase terminé**
- Projet existant `doorjfxqetoawqnvguvz` → renommé scribe-sandbox
- Connexion via pooler AWS (IPv4)
- `.env.local` généré (anon + service_role + DB URL pooler)
- `npm install` — 385 packages installés

✅ **Migrations appliquées** (2/2)
- `0001_init_auth.sql` → tables `organizations`, `users`, triggers org+profil auto
- `0002_harden_function_grants.sql` → hardening des grants

✅ **Tests d'isolation** 4/4 pass — RLS fonctionnelle
- Création org + profil par inscription
- Org A ne voit QUE ses données
- Cross-org bloqué même en ciblant l'ID
- Injection `invite_org_id` ignorée (anti-fuite)

✅ **Check RLS** — vert
- `users` → RLS ON + policies org_id ✓
- `organizations` → RLS ON (table racine, sans policy = OK)
- `_scribe_migrations` → RLS ON (table interne)
