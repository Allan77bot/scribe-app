## 2026-06-27 (suite 3) — Reste des failles faisable sans backend (fix/) ✅

### Concern
« Tout le reste que tu peux faire » en attendant le Supabase payant → corriger en code/migration
le maximum de failles MEDIUM/LOW de l'audit, sur `fix/failles-securite-high`. Suivi via TaskList (10 tâches).

### Corrigées (8 commits séparés, build vert, lint OK)
- **AS-21** (headers) — `next.config.ts` `headers()` : CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy (`microphone=(self)` conservé pour le micro) + `poweredByHeader:false`.
  **Vérifié en runtime** : 0 violation CSP sur `/login` et `/signup` ; les 5 tests `security-headers` passent
  de `fixme` à actifs → **6/6 verts** en local.
- **AS-11** — politique mot de passe ≥ 8 **côté serveur** (signup).
- **AS-13** — `display_name`/`org_name` bornés + nettoyés (`cleanLine`) au signup + **trigger 0016** (clamp en base).
- **AS-06** — `escapeHtml` sur `org_name`/`display_name`/invitant dans les e-mails (`send.ts`).
- **AS-07** — prompt injection : données utilisateur déplacées dans le message **user**, délimiteur
  ALÉATOIRE (`randomUUID`) + neutralisation + consigne anti-injection (rapport, passation, extraction).
- **AS-08** — `raw_text` et `transcript` bornés (~12k) avant l'appel IA (anti « wallet DoS » par appel).
- **AS-15** — validation de schéma de la sortie Haiku (`validateExtractedTasks` : priorité ∈ enum, titres
  tronqués, max 50 tâches) → plus de tâche forgée stockée.
- **AS-20** — sniff des **magic bytes** à l'upload avatar (JPEG/PNG/GIF/WebP) ; refus SVG / Content-Type spoofé.
- Utils partagés : `escapeHtml` + `cleanLine` (boucle code-point) dans `lib/sanitize.ts`.

### Migration écrite (à appliquer en prod APRÈS 0015)
- **0016** — trigger `clamp_user_display_name` (BEFORE INSERT/UPDATE, indépendant de `handle_new_user`).

### REPORTÉES (raison explicite)
- **AS-04/05/10/14** (rate-limit) + captcha : besoin d'**infra partagée** (Upstash/Vercel KV) + clés Turnstile
  qu'Allan doit provisionner ; un limiteur en mémoire serait faux sur serverless.
- **AS-09/16/17/19** (policies storage) : RLS storage **non testable sans backend**, historique de policies
  emmêlé (0003/0009/0011/0012, 0011 droppe tout) à réconcilier, + décision « chemins org-préfixés ».
  AS-02 (déjà corrigée) ferme l'exploit principal. À faire avec le backend vivant.
- **AS-18** (rapport/passation admin-only) : **décision produit** — en 3×8 le chef d'équipe sortant n'est
  pas forcément admin ; restreindre casserait le flux. Org-scoping déjà correct (pas de cross-org).
- **AS-12** (invitation acceptée avant preuve e-mail) : à traiter avec la couche invitations.

### Vérifs
`npm run build` ✅ **30 routes**, lint OK. Suite `security-headers` **6/6 verte** (rejouée en local).
Migrations en attente d'application prod, dans l'ordre : **0013 → 0014 → 0015 → 0016**. **Rien poussé.**

---

## 2026-06-27 (suite 2) — Correctifs sécurité : 3 failles HIGH (branche `fix/`) ✅

### Concern
Avancer pendant l'attente du Supabase payant. Choix d'Allan : corriger les failles de l'audit, **les 3
HIGH d'abord**. Setup git : travail d'audit du jour committé sur `chore/audit-securite` (`dd34020`
suite e2e + `4f95892` docs), puis branche **`fix/failles-securite-high`** créée depuis là.

### Correctifs (3 commits séparés, reviewables)
- **AS-03** (`85375ad`) — `src/lib/pipeline/actions.ts` : `"use server"` → `import "server-only"`.
  `processEntry` n'est plus une server action (c'était un IDOR : appelable avec un `entryId` arbitraire,
  traitement en service_role sans contrôle d'org). Vérifié : appelé **uniquement** depuis
  `entries/actions.ts` via `after()`.
- **AS-02** (`5354c4b`) — `src/lib/entries/actions.ts` (`createEntry`) : valide que `storage_path`
  commence par `${user.id}/` (préfixe imposé par `getSignedUploadUrl`) + rejet de `..`. Bloque
  l'exfiltration d'audio cross-org (le pipeline téléchargeait le chemin en service_role, hors RLS).
- **AS-01** (`63323a7`) — migration **`0015_lock_user_privileges.sql`** : `revoke update on
  public.users from authenticated` + `grant update (display_name, color, avatar_url,
  onboarding_complete)`. Bloque l'escalade member→admin via `PATCH /rest/v1/users {"role":"admin"}`
  direct sur PostgREST. DO block **défensif/idempotent** (ne grant que les colonnes présentes).
  **Recensé toutes les écritures session sur `users`** (updateProfile, onboarding employé,
  markOnboardingComplete, avatar) → aucune n'écrit `role`/`org_id`/`email` → le grant ne casse rien.

### Vérifs
`npm run build` ✅ **30 routes** (`server-only` résout, AS-02/03 compilent, pipeline n'est plus une
server action). AS-01 = SQL, non exécutable ici. **Rien poussé.**

### Reste (pour reprise)
- 🔴 **Appliquer en prod, dans l'ordre : `0013` → `0014` → `0015`** (snapshot DB avant). `0015` = AS-01.
- ⏳ Vérif backend des 3 quand Supabase payant prêt (`PATCH role=admin` → **403** ; upload cross-path → rejet).
- Tests de non-régression AS-01/02/03 (reportés) ; MEDIUM + LOW restants → `docs/audit-securite-2026-06-27.md`
  §« Ordre de correction recommandé ». AS-21 (headers) 100% faisable sans backend.

---

## 2026-06-27 (suite) — Tests Playwright EN DIRECT sur les formulaires (sandbox vivant) ✅

### Concern du jour
« On fait les tests Playwright en direct sur les formulaires. » Pilotage **navigateur réel** via le
**MCP Playwright** (désormais actif) sur `/signup` et `/login`, en mobile-first (viewport 393px).
Serveur dev relancé sur **:3001** (port 3000 occupé). Toujours sur `chore/audit-securite`.

### Couche client / rendu — TOUT VERT (en direct)
4 champs présents ; `password` `type=password`+`minlength=8` (un mdp 7 car. **réellement** bloqué,
message FR natif, prouvé par frappe clavier) ; `email` `type=email` ; `org_name`/`email`/`password`
requis ; `maxLength` 120/80 ; submit vide bloqué ; **zéro overflow horizontal** ; payload XSS dans le
champ nom d'org = chaîne littérale ; **`?error=`/`?message=` reflétés mais échappés par React** (pas de
XSS) sur `/login` ET `/signup`.

### Saga `.env.local` (3 itérations)
(1) pointait sur le sandbox `doorjfxqetoawqnvguvz` avec **clé anon périmée** (401 même avec la clé) →
soumissions rejetées « Invalid API key », masquées en messages génériques côté UI (bonne hygiène). (2)
Allan met à jour → `.env.local` pointe alors sur **`kgbxxzujlubflsvprmef` = la PROD** → **refus de
tester** (créerait comptes/XSS dans la vraie base, viole règle d'or n°2). (3) Allan re-corrige → sandbox
`doorjfxqetoawqnvguvz`, **clé anon valide** (health 200). Rien n'a été écrit en prod.

### LE GROS TRUC : inscription cassée → corrigée en direct
Première vraie inscription → `[auth:signup] Database error saving new user`. Sondes lecture seule
(service_role) : colonnes `onboarding_complete`/`color`/`avatar_url` **présentes** (0010+0014 OK) → pas
un drift de colonnes. Repro de l'insert org : `plan='free'` → **`22P02 invalid input value for enum
org_plan: "free"`**. Cause racine = trigger `handle_new_user()` version 0011/0012 (insère `plan='free'`),
**migration `0013` non appliquée sur le sandbox**. **Allan a exécuté `0013` en direct → l'inscription
remarche end-to-end** (compte + org + rôle admin + couleur auto, vérifié en base). ⚠️ **C'est l'ACTION 1
du snapshot, mais pour la PROD** : prouvé que sans `0013`, toute inscription échoue. À prioriser sur
`kgbxxzujlubflsvprmef`.

### Flux réels (sandbox, comptes jetables `@mailinator.com`)
- **Inscription réelle** ✅ → redirige `/login?message=confirm-email` (confirmation active,
  `mailer_autoconfirm:false`). `@example.com`/`@exemple.com` **rejetés** par Supabase (pas de MX).
- **XSS stocké** ✅ neutralisé : compte créé (via API admin pré-confirmé) avec org_name piégé
  `"><img src=x onerror=...>` + display_name `<b>AdminX</b>` → après login, sur `/dashboard` les deux
  s'affichent en **texte inerte** (échappement React), aucune exécution, aucun `<img>`/`<b>` injecté.
  Couvre AS-13/AS-06 au rendu.
- **Anti-énum. connexion** ✅ : e-mail inexistant vs existant+mauvais mdp → réponse **identique**
  (`400 Invalid login credentials`). Pas de fuite d'existence.
- **Anti-énum. inscription** ⚠️ : message générique, mais A/B propre **bloqué par le rate-limit e-mail**
  (`email rate limit exceeded` / `you can only request this after N seconds`) — rate-limit GoTrue **actif**
  (mitige AS-04/10). À reconfirmer hors fenêtre.
- **Données de test purgées** : 2 comptes Auth (DELETE 200) + 2 orgs (204), vérif post-nettoyage vide.

### Correction de la suite e2e (demandée)
`payloads.ts` : helper **`uniqueTestEmail(prefix)`** + `TEST_EMAIL_DOMAIN="mailinator.com"` (MX valide).
Remplacé les 6 `@exemple.com` (`auth-signup` ×4, `email-rate-limit` ×2) ; gardé le `victime@exemple.com`
de `ABUSE_STRINGS.newlines` (charge d'injection d'en-tête CRLF, intentionnelle). Commentaire anti-énum.
enrichi (réalité rate-limit + confirmation). `README.md` : prérequis e-mail MX + **0013 sur le sandbox**
+ rate-limit. `npx playwright test --list` ✅ (suite compile, import résout).

### État
Serveur dev sur **:3001** (laissé tournant). `.env.local` = **sandbox** (à laisser ainsi). Sandbox :
`0013` désormais appliqué, données de test purgées. **Rien commité, rien poussé** (modifs : 3 fichiers
`tests/e2e/` + README). Reste : `0013` sur la PROD (critique, prouvé), reconfirmer anti-énum. inscription.

---

## 2026-06-27 — Audit sécurité + suite Playwright + plan chiffré (ultracode, 37 agents) ✅

### Concern du jour
Allan reprend le projet (Supabase payant en attente). Demandes : (1) que faire des MCP Playwright,
(2) tests UX/UI des formulaires d'inscription + anti prompt-injection + sécu des données au max,
(3) plan des étapes suivantes (images de bienvenue, base interne entreprise, domaine acheté) + %
d'avancement + tâches d'une ligne. Sous-agents demandés : agent sécurité + agent planificateur.
Branche dédiée **`chore/audit-securite`** créée depuis `feat/onboarding`.

### Playwright MCP
**Pas installé** dans la session (vérifié : `claude mcp list`, `package.json`, pas de config). Installé
via sous-agent en scope user : `claude mcp add playwright --scope user -- npx @playwright/mcp@latest`
(✔ Connected, Chromium 149 téléchargé, bloc écrit dans `C:\Users\allan\.claude.json`). **Actif au
prochain redémarrage** de Claude Code uniquement.

### Méthode — ultracode (workflow, 37 agents)
4 dimensions d'audit en parallèle (formulaires-inscription · prompt-injection-pipeline-ia ·
isolation-donnees-rls · secrets-endpoints-config), chaque finding **vérifié en adversarial** (biais
défaut = réfuter, effort high). + 1 agent planificateur en parallèle. **32 pistes brutes → 21
confirmées, 11 écartées** (faux positifs : ex. le mot de passe passé à `dispatchVerificationEmail`
est normal/server-only ; processEntry-no-auth doublon ; storage-policy-wipe non exploitable).

### Failles confirmées (détail : `docs/audit-securite-2026-06-27.md`)
- **3 HIGH** : AS-01 escalade member→admin (policy `users_update_self` 0001:111 ne protège pas `role`
  → `PATCH /rest/v1/users {"role":"admin"}` direct) ; AS-02 exfiltration audio cross-org (`storage_path`
  client non validé, `entries/actions.ts` + `pipeline/actions.ts`) ; AS-03 `processEntry` server action
  `service_role` sans autorisation (IDOR write + abus coût).
- **7 MEDIUM** : email-bombing `/api/auth/confirm` (AS-04/10), spam invitations (AS-05), injection HTML
  e-mails via org_name/display_name (AS-06), prompt injection system-prompt rapport/passation (AS-07),
  wallet-DoS notes texte sans quota (AS-08), lecture audio cross-org policy SELECT (AS-09).
- **11 LOW** : password policy serveur (AS-11), invitation consommée avant preuve e-mail (AS-12),
  display_name non borné (AS-13), pas d'anti-bruteforce (AS-14), sortie Haiku sans validation schéma
  (AS-15), policies storage avatars/audio trop permissives (AS-16/17), report/handover insert
  service_role sans check admin (AS-18), bucket avatars world-readable (AS-19), content-type spoofing
  upload (AS-20), aucun header de sécurité (AS-21).
- **Déjà conforme** : anti-énumération, sanitizer HTML, signature webhook Stripe, service_role non
  exposé, endpoint migrate gardé session+rôle, middleware /dashboard.

### Suite de tests Playwright (`tests/e2e/`)
`playwright.config.ts` (mobile-first Pixel 5 + desktop, webServer auto `npm run dev`), `@playwright/test`
ajouté en devDep. Specs : `auth-signup`, `route-protection`, `injection-payloads`, `security-headers`,
`email-rate-limit` + `payloads.ts` + `README.md`. Les `test.fixme` encodent le comportement sécurisé
attendu des failles connues (→ deviennent garde-fous au fix). `.gitignore` : sorties Playwright ignorées.

### Plan chiffré (agent planificateur)
**MVP vendable Route B ~53%** (moteur produit ~60-65%, mais manquent : passage en réel, conformité
RGPD ~8%, couche commerciale). Modules : auth 82% · capture 85% · pipeline IA 75% · tâches+validation
55% · rapport/passation 60% · onboarding 80% · équipe 80% · billing 45% · design 90% · sécu/RLS 68% ·
conformité 8% · infra 38% · contenu 15%. P0 : Supabase payant → 0013 puis 0014 → merge PR #8 → merge
onboarding → domaine → Stripe live → retirer /demo. P1 : conformité minimale, images onboarding+OG,
base interne, notif relève, assignation tâches.

### Vérifs
`tsc` ✅ · `lint` ✅ · `next build` ✅ **30 routes**. **Aucun correctif de faille appliqué** (audit only).
**Rien commité, rien poussé.**

### Reste / next
- Trancher avec Allan quels correctifs implémenter (reco : AS-01/02/03 d'abord, puis rate-limit
  transversal, puis validation serveur ; les correctifs migration s'appliquent en prod par Allan).
- Au redémarrage Claude Code : Playwright MCP dispo → tests navigateur en direct (app lancée +
  Supabase sandbox jetable, jamais la prod).

---

## 2026-06-26 — feat/onboarding implémentée (ultracode, 7 agents) ✅

### Concern du jour
Allan valide : démarrer `feat/onboarding` (levier rétention n°1 de l'audit hook-model). Branche créée
depuis `feat/design-system` (le produit y vit), l'orbe reste séparé sur `feat/capture-orb`. Brainstorm +
design validé **avant** tout code (skill brainstorming).

### Découverte d'audit (hors spec du 21/06)
Le drapeau `onboarding_complete` était sur **l'organisation** (0006). Un employé invité rejoint une org
déjà onboardée → renvoyé au dashboard → **le parcours employé ne se déclenchait jamais**. Décision (Allan,
via AskUserQuestion) : **onboarding par-personne** → migration `0014` (`users.onboarding_complete`).

### Méthode — ultracode (workflow, 7 agents)
Spec d'implémentation écrit d'abord (contrats d'interface figés : signatures actions, props composants, nom
de colonne) pour permettre le parallélisme sans conflit. Puis workflow :
- **Build** (3 agents parallèles, fichiers DISJOINTS → zéro conflit) : couche serveur (`0014` + actions +
  factorisation `inviteOne`/`loadInviteContext` + refactor de l'API route), `OnboardingTour`, `FirstRunNavGuide`.
- **Integrate** (1 agent) : `OnboardingWizard` refondu (2 parcours) + pages + layout + `ReplayGuideButton`,
  calé sur les interfaces réelles ; `tsc` vert.
- **Review** (3 agents adversariaux, read-only) : sécurité/RLS, correctness, UI/a11y/vouvoiement → **18 findings**.

### Findings traités (les 4 réels ; convergence des dimensions)
1. **Guide nav par-dessus le wizard** (HIGH) : `FirstRunNavGuide` (monté dans `dashboard/layout`)
   s'affichait sur `/dashboard/onboarding` et grillait la clé « vu ». **Corrigé en déplaçant la route**
   `/dashboard/onboarding` → **`/onboarding`** (hors layout dashboard) → règle AUSSI le chrome visible
   (finding #4 : plein cadre fidèle à la maquette). Le proxy couvre déjà toutes les routes → pas de modif auth.
2. **Échecs d'invitation avalés** : le wizard ignorait invalid/already_member/error. → on surface le récap
   et on **n'avance pas** si rien n'aboutit alors que des champs sont remplis.
3. **ColorPicker `taken={[]}`** : l'employé voyait les couleurs prises comme libres (mur au submit). →
   `onboarding/page.tsx` charge les couleurs prises (RLS) et les grise.
4. **Tap < 44px** (puces du tour, pastilles ColorPicker) → élargis à 44px.
   \+ quick wins : dédup e-mails (sentCount juste), `completeOnboarding` message générique, backfill `0014`
   admin-only (les employés existants jamais onboardés verront leur parcours), pulse du guide via token
   (suit le dark mode), focus clavier initial.

### Dette notée (non corrigée — hors scope / pré-existant)
- Policy `inv_insert` (0012) n'exige pas `role=admin` au niveau DB (défense en profondeur entamée ; l'app
  vérifie déjà admin via `loadInviteContext` → **non exploitable** via le code). À traiter en branche dédiée.
- Pas de contrainte `UNIQUE(org_id, color)` → TOCTOU couleur (déjà le cas dans `updateProfile`).
- `inviterName` affiché = admin le plus ancien, pas l'inviteur réel (`invitations.created_by`).

### Vérifs
`tsc` ✅ · `lint` ✅ · `next build` ✅ **30 routes** (`/onboarding` présent, `/dashboard/onboarding`
supprimé). `check:rls` non rejouable ici (`SUPABASE_DB_URL` absent du `.env.local` de ce poste) — `0014`
n'ajoute aucune table à `org_id` → RLS inchangée par construction (confirmé par la review sécurité).

### Commits (3, locaux, NON poussés)
`e33fa26` docs (spec d'implémentation) · `f62fce9` feat back (`0014` + actions + service) · `4da1fc7`
feat front (wizard + tour + guide + déplacement de route).

### Reste / next
- **Ops Allan** : appliquer `0013` PUIS `0014` en prod (snapshot DB avant). Sans `0014`, le déclencheur est
  défensif (app utilisable, wizard non imposé tant que la colonne n'existe pas).
- Décider **push + PR** de `feat/onboarding` (et `feat/capture-orb`), après/avec la PR #8.
- `/demo` toujours en place (à retirer ou mettre derrière un flag, à la PR).

---

## 2026-06-25 — Clôture feat/design-system : vouvoiement + Branding/ ignoré + push & PR #8 ✅

### Concern du jour
Boucler `feat/design-system` (ACTION 0 du snapshot) : normaliser tu/vous, trancher
le sort de `Branding/`, puis intégration. Une seule préoccupation, branche en cours.

### Fait
- **Copy unifiée en VOUVOIEMENT** (décision Allan : `vous` partout — déjà la langue
  du cœur de l'app : capture/tâches/rapport ; plus sûr pour un outil B2B en équipe
  industrielle). Audit grep (pronoms + impératifs singuliers), puis conversion de
  **23 fichiers** via 3 sous-agents parallèles pilotés par une table de conversion
  stricte (cohérence de conjugaison garantie). Périmètre : landing, auth, invitations,
  réglages, équipe, messages d'erreur, démo, **et copy des e-mails** (`send.ts` ;
  re-brand visuel e-mail toujours réservé à `feat/email-brand`). **Exclus** : prompts
  IA (`Tu es un assistant…` = on parle au modèle), « Ton » au sens *tonalité* dans ces
  prompts, commentaires de code, label « Capture ». Vérif grep finale : zéro tutoiement
  résiduel hors exclusions. (commit `193ebe7`)
- **`Branding/` ignoré** (décision Allan) : l'export brut du handoff (817 K, 76 fichiers :
  composants JSX déjà ré-implémentés, cartes HTML guidelines, logos en double) est généré
  et redondant. Les logos/icônes sont déjà dans `public/logos` + `public/icons`, le design
  system dans `DESIGN.md`, la source dans le projet Claude Design. Ajouté au `.gitignore`,
  gardé en local. (commit `0d5f521`)

### Constat majeur — topologie des branches
`feat/design-system` n'est PAS une fine branche de design : **73 commits / 240 fichiers /
+24 930 lignes** en avance sur `main` — elle porte **tout le produit** (Phases 1-5, stabilité,
design). Surtout : la chaîne `prototype → fix/stabilite-prod → feat/design-system` **n'était
poussée nulle part** (pas d'upstream → produit entier sur le seul disque local d'Allan).
`main` diverge de 1 commit (`docs(hermes)` auth VPS) → merge 3-way, pas un fast-forward.

### Intégration (décision Allan : pousser + PR)
- `git push -u origin feat/design-system` → **branche sauvegardée sur GitHub** (fin du risque
  de perte locale).
- **PR #8** ouverte vers `main` : https://github.com/Allan77bot/scribe-app/pull/8 — décrit
  honnêtement l'ampleur (intègre tout le produit) + les prérequis avant merge.

### Vérifs
`tsc --noEmit` ✅ · `eslint` ✅ · `next build` ✅ (**30 routes**). Working tree clean.

### À savoir avant de merger la PR
- **Migration `0013` à appliquer en prod** (`kgbxxzujlubflsvprmef`, snapshot DB avant) = ACTION 1,
  ops Allan. Merger le code ≠ migrer la base ; tant que `0013` n'est pas passée, validation de
  tâche + passation plantent en prod.
- Merge 3-way (main diverge de 1 commit). Pas de Vercel branché sur `main` → intégration de code,
  pas une mise en prod.

---

## 2026-06-24 — Brand guide → design system « Scribe IA » implémenté (feat/design-system) ✅

### Contexte
Allan livre un **design system complet** qu'il a construit lui-même dans un projet Claude Design
(« Scribe IA Design System »), importé via le MCP **DesignSync**. Source de vérité = ce projet
(tokens, 9 composants, guidelines de marque, logo, ui_kit). Demande : l'implémenter dans l'app.
Le DS final reste sur **Manrope** (le « Inter » des planches logo a été abandonné).

### Branche
`feat/design-system` créée depuis `fix/stabilite-prod` (rappel : `main` est quasi vide, tout le
produit vit sur les branches feature). Le lot stabilité était **déjà commité** (le snapshot du
2026-06-21 était périmé : working tree propre sauf `Branding/`).

### Fait — 5 stages, 6 commits, build 28 routes vert, tsc + lint propres. Rien poussé.
- **Stage 1 — Foundation** (`globals.css`, `layout.tsx`, `manifest.ts`) : remap des tokens @theme
  vers la palette DS (paper chaud `#F8F7F4`, cobalt désaturé `#2A4FB0`, **accent CYAN `#22D3EE`**
  = signature « validé/actif », ambre rare, statuts proposed/validated/done/rejected, hairlines
  chaudes, ombres basses). themeColor + background paper (fin du résidu sombre `#0f172a`). Markup
  inchangé → re-skin par les seules valeurs des tokens. (commit `e3faf43`)
- **Stage 2 — Logo** : favicon + `apple-icon` + icônes PWA + composant `Logo` (mark + mot-marque),
  câblé landing + invite. Anciennes icônes Atelier Klar supprimées (accord Allan). (commit `e3faf43`)
  ⚠️ **Correction (nuit 24→25, commit `3b1d818`)** : la 1ʳᵉ version utilisait par erreur le S « fleuve »
  de `uploads/…svg` (une source/concept). Allan a pointé le **handoff** (`Branding/…/assets/logos`) → le
  **logo officiel est le S angulaire** (color cobalt + pointes cyan / white-cyan en dark / cobalt mono).
  Swap : PNG officiels détourés (`public/logos`), favicon `icon.png`, bascule clair/dark via CSS.
  `Branding/` + `legacy/` ajoutés aux ignores eslint. + `suppressHydrationWarning` sur `<html>`
  (le script anti-flash pose `data-theme` avant hydratation → mismatch SSR volontaire, attendu).
- **Stage 3/4 — Composants + écran Tâches (preuve)** : `components/ui/StatusBadge` (4 statuts,
  cyan = Active) + `components/ui/Button` (pilule, ≥44px, 4 variantes). `TaskValidationCard` refondu
  au look DS — **logique / RLS / server actions intactes**. Page publique `/demo/ds` (aperçu réel
  des composants sans login). Fix token `surface-container` (blanc → gris, pastille invisible).
  (commit `0ce8e95`)
- **Stage 4 — Rollout 5 écrans** (5 sous-agents en parallèle) : chrome (logo dans le layout, nav
  basse hairline, UserMenu), Accueil (cartes hub, `.tnum`, eyebrows), Capture (segmented control,
  Button, couleurs waveform sur tokens — **waveform réelle préservée**), Passation (sections rapport
  lisibles, accusés de lecture sans cadrage surveillance), Équipe (cartes membres, invitations,
  badge rôle ambre). Logique partout préservée. (commit `1f4bcdb`)
- **Stage 5 — Dark mode marine** (nuit du 24→25) : tokens marine sous `html[data-theme="dark"]`
  (surfaces #12132A/#1A1A2E, cobalt remonté #4F73D6, ombres noires) ; token thémable `bg-card`
  (47 `bg-white` remplacés / 24 fichiers) ; **logo S blanc** en dark (`--logo-s`/`--logo-cut`) ;
  toggle clair/sombre dans le menu compte (`useSyncExternalStore`, SSR-safe) + **script anti-flash**
  + `themeColor` clair/sombre. (commit `1482dd8`)

### Reste / à surveiller
- **Incohérence voix tu/vous** : l'écran Capture est passé en « vous », le reste tutoie → normaliser en « tu ».
- **Muted `#8A93A3`** (choix du DS) frôle l'AA sur très petit texte — à surveiller au cas par cas.
- **`Branding/`** (4 planches concept logo) toujours non suivi — à committer (référence) ou retirer.
- Rien poussé, pas de PR. Migration prod `0013` toujours = ops Allan (inchangé).

## 2026-06-21 — Lot stabilité codé + design produit (onboarding & assignation) maquetté ✅

### 1. Lot `fix/stabilite-prod` IMPLÉMENTÉ (branche dédiée, non commité)
Suite aux décisions ultracode (stabilité d'abord), code écrit sur `fix/stabilite-prod` :
- **`supabase/migrations/0013_reconcile_drift.sql`** — migration **idempotente/défensive** qui
  converge depuis n'importe quel état prod : `task_validations` en forme `0006`
  (`entry_id`+`task_index`+`unique`, ne DROP que si forme drift ET vide), `reports.kind` garanti,
  `handle_new_user` restauré (version `0010` : invitation + couleur) + **un seul** trigger.
- **`src/components/AudioRecorder.tsx`** + **`src/lib/audio/pending.ts`** — blob persisté en IndexedDB
  dès l'arrêt, « Réessayer » **renvoie** (n'efface plus le blob), récupération au montage, renvoi auto
  au retour du réseau. Fin de la perte d'enregistrement terrain.
- **`src/app/api/admin/migrate/route.ts`** — token statique `scribe-migrate-2026` **retiré** →
  garde **session + rôle admin** (règle d'or n°1) + sert de vérificateur post-migration.
- `lint` + `build` **verts** (23 routes ; `npm install` requis : 9 paquets manquaient). `check:rls` /
  `test:isolation` non rejoués (DB live = ops Allan ; `test:isolation` écrit → jamais sur la prod).
- ⚠️ **Reste à faire (Allan)** : exécuter `0013` sur la prod `kgbxxzujlubflsvprmef` après snapshot DB.
  Firsthand : `0012` avait régressé le trigger (invitation perdue + `plan='free'` invalide pour l'enum
  + trigger en doublon) — tout corrigé par `0013`.

### 2. Design produit avec Allan — maquettes `/demo` (public, sans login, jetable)
Allan bloqué par l'auth (signup cassé en prod) → espace **`/demo`** créé pour prévisualiser sans login :
- **`/demo/onboarding`** — nouvel onboarding fluide, **2 parcours** (toggle Manager/Employé) :
  Manager = nommer l'équipe → inviter (« combien êtes-vous » règle le nb de champs = **idée A**) →
  mini-tour 3 onglets → prêt ; Employé = bienvenue (rejoint) → profil (nom+couleur) → mini-tour → prêt.
- **`/demo/dashboard`** — hub + **guide « première fois »** : voile + chaque onglet s'allume avec une bulle.
- **`/demo/tasks`** — **assignation & suivi** : badges **initiales** (AM/SD…), assignation, création manuelle
  (briefing), filtre par personne, **réglage admin** « qui peut assigner », toggle Manager/Employé.
- **`/demo/capture`** — réutilise l'écran réel pour montrer le fix enregistreur.
- Décisions design : couleur = **priorité** (couleur membre seulement sur l'avatar) ; **pas de shift** à
  l'inscription (rotation 3×8) ; friction douce sur le skip d'invite ; admin épinglé bleu.

### 3. Specs écrits (convergence)
- **`docs/specs/2026-06-21-onboarding.md`** → branche `feat/onboarding`.
- **`docs/specs/2026-06-21-tasks-assignment.md`** → branche `feat/tasks-assignment` (⚠️ trancher
  JSONB vs table `public.tasks` au début).

### Next (déterminé, cf. `snapshot.md`)
1. Allan exécute `0013` en prod (snapshot avant) → débloque le produit. 2. Commit/hygiène sur OK Allan.
3. `feat/onboarding`. 4. `feat/tasks-assignment`. Rien poussé ; `/demo` à retirer avant PR.

## 2026-06-19 — Passage à l'ACTION : jugement par skill + décisions stratégiques (ultracode) ✅

### Méthode
Mode ultracode, 2 workflows multi-agents (**48 agents** au total) :
1. **Jugement par skill** (23 agents) — 1 agent/skill applique son `SKILL.md` au code réel
   (preuves `fichier:ligne`), puis 1 sceptique adversarial par faiblesse critique (défaut = réfuter).
2. **Boucle de décision** (25 agents) — pour 4 décisions : débat chiffré (1 avocat/option) →
   juge → challenge adversarial → juge final (stabilité). Le challenge a **renversé 3 verdicts sur 4**.

### Verdicts (scores /10 après réfutation)
claude-code-build **5,5** · retention **4,5** · ship-mobile-app **4,5** · design-ui **6,5**.
- **Critiques CONFIRMÉES** : schema drift `task_validations` (`0006` entry_id+task_index+unique
  VS `0012` task_id sans unique → validation humaine plante, RG n°4) ; `reports.kind` absent de
  `0012` (passation insert+select KO) ; token statique `scribe-migrate-2026` sur endpoint
  service_role (viole RG n°1) ; perte d'enregistrement vocal si l'upload échoue ; 0 notif au
  shift entrant ; génération de passation 100 % manuelle + bug fenêtre UTC.
- ➕ Trouvaille firsthand (lecture 0006/0012) : `0012` a aussi **régressé le `handle_new_user`
  de `0007`** → un invité recrée une org au lieu de rejoindre la sienne.
- **Dégradés en mineur par les sceptiques** (≠ audit du matin) : dark mode (le skill le classe
  lui-même P3), focus-visible, contraste AA, collision 0011 / policies storage (bucket privé +
  service_role → non exploitable), révélation temps réel des tâches.

### Décisions
- (a) Vertical : **logistique par défaut, NON gelé** (agro descendu — IFS/HACCP faux en droit ;
  santé = #2, mur HDS). Vrai déterminant = réseau d'Allan + 5-10 entretiens.
- (b) Pricing : **par-siège simple au lancement** (marge >89 % prouvée, quota = risque fantôme),
  compteur minutes gardé en garde-fou interne. **Décision finale = Allan, session dédiée.**
- (c) Conformité : **minimale séquencée** (réparer bloquants d'abord, socle minimal ~3j,
  kit CSE à la demande, purge reportée).
- (d) Séquencement : **stabilité d'abord** — Sprint 1 = `fix/stabilite-prod` mono-concern
  (schema drift + perte enregistrement + token), notif reportée après discovery du canal.

### Next
Lot P1 n°1 = **`fix/stabilite-prod`**. Migration `0013` idempotente/défensive (réconcilie depuis
n'importe quel état prod), fix `AudioRecorder` (blob persistant), garde de session sur
`/api/admin/migrate`. ⚠️ Exécution de la migration sur la prod réelle = **ops Allan** (snapshot
DB avant ; sandbox mort ici, CI verte ≠ preuve sur données réelles). Aucune PR sans accord.
**Aucun code Scribe touché dans cette session de décision.**

## 2026-06-19 — Forge des 2 skills V7 « build avec Claude Code » (mode étude) ✅

Allan a collé la transcription COMPLÈTE de la vidéo 7 (`docs/v7-transcript-a-coller.md`)
→ extraction (agent) → 2 skills installés niveau utilisateur :
- **`~/.claude/skills/claude-code-build/`** — discipline Claude Code réutilisable (contexte
  `/init`/`/clear`/`/compact`, design-first, framework MVP 5 points, test loop 3 étapes,
  audit sécu en contexte vierge + prompt générique en `references/`, secrets `.env`, GitHub tôt).
- **`~/.claude/skills/ship-mobile-app/`** — spécifique mobile natif (Expo/RN, Expo Go,
  Supabase+RLS, edge functions, EAS build/submit, App Store + Play, `references/deploy-stores.md`).
Corrections : « Anti-Gravity » = **Google Antigravity** (IDE, fork VS Code) — IDE
interchangeable ; prompt d'audit sécu de Nick non fourni → remplacé par un prompt générique.
**Découpage 2 skills validé par Allan.** Panel passe-2 NON rejoué sur ces 2-là (session
longue) — à faire si besoin. **Aucun code Scribe touché.**

## 2026-06-19 — Audit global Scribe avec les nouveaux skills (mode étude) ✅

### Contexte
Une fois `design-ui` + `retention` forgés, Allan demande un **audit global** de Scribe à
leur lumière. 2 agents en parallèle appliquent chaque skill au code réel (preuves
`fichier:ligne`), puis synthèse en plan priorisé Route B. **Aucun code touché.**

### Constats clés (convergents design + rétention)
- **Boucle de valeur jamais fermée pour un nouvel user** : l'invite à l'onboarding est
  OPTIONNELLE (`OnboardingWizard.tsx` étape 2) → sans 2ᵉ membre, pas d'accusé de lecture,
  pas de passation reçue → churn. **Levier n°1.**
- **Aucun déclencheur externe** : pas de notif/e-mail de relève (pourtant Brevo est branché).
- **Récompense cassée** : après capture, « rechargez dans quelques secondes » au lieu d'une
  révélation temps réel des tâches extraites.
- **Route B mal servi** : pas de dark mode (shift de nuit aveuglé), boutons de validation à
  36px (< 44px WCAG), « Rejeter » sans filet.
- **Garde-fou** : ne jamais exposer « qui n'a PAS lu » (surveillance perçue = mort de
  l'adoption terrain).
- **Déjà bon** : waveform live, accusés de lecture avec délai, empty states tâches/passation,
  sanitizer HTML.

### Livrable
`docs/audit-global.md` — plan priorisé P1/P2/P3 Route B. Snapshot « Prochaines étapes »
mis à jour pour pointer dessus. Pointeur ajouté dans `CLAUDE.md`.

### Next
Exécuter les P1 (quand on repasse en mode dev, sur branches dédiées) ; recevoir la
transcription V7 d'Allan → forger le skill « build avec Claude Code ».

## 2026-06-19 — Forge de 2 skills depuis 4 vidéos YouTube (mode étude) ✅

### Contexte
Allan envoie 4 vidéos (`A: <lien>`, playlist design/Claude Code) pour enrichir les skills
avant de reprendre le dev. Skill `regarder-video` : Gemini = les yeux, puis Forge.

### Vidéos analysées (Gemini via firecrawl/script + 1 transcript yt-dlp)
- V1 « The Truth About Gamification » → design comportemental / rétention.
- V2 « 11 UI/UX principles in 10 minutes » → craft visuel systématique.
- V3 « How to Design Your First Dashboard UI » → composition de dashboard.
- V7 « How to Build Mobile Apps with Claude Code (Full Course) » de Nick Saraev → trop
  longue pour la voie visuelle Gemini → **transcript yt-dlp** (install via
  `python -m pip install -U yt-dlp`). Thème distinct (build avec Claude Code) → skill
  potentiel séparé, NON forgé (en attente accord Allan).

### Forge (pipeline regarder-video, 2 checkpoints + panel ×2)
- Checkpoint 1 : compréhension validée. Décision Allan : **2 skills séparés** (pas 1
  combiné) — sur reco [bloquant] du panel « productivité ».
- Panel passe 1 (plan) + passe 2 (draft), 3 angles (Optimisation / Spécialiste IA /
  Productivité). Corrections intégrées : lecture de l'existant avant audit, nuances WCAG
  (4.5:1 corps vs 3:1 titres), dark mode Material 2 vs 3, `useOptimistic` (état temporaire,
  pas rollback magique), tracking en `em` pas `%`, leading 1.5 corps, chiffres non sourcés
  ramollis (notif, J7), garde-fou éthique Hook, triggers FR enrichis.

### Livrables (niveau utilisateur, réutilisables tous projets)
- **`~/.claude/skills/design-ui/`** — craft visuel + composition de dashboard. Sortie =
  audit ≤ 5 points par impact. Router Acte 0. + `references/checklist-ui.md`.
- **`~/.claude/skills/retention/`** — design comportemental (Hook, anti-PBL, anti-patterns
  B2B). Sortie = 3 mécaniques priorisées. + `references/patterns-retention.md`.
- Renvoi mutuel entre les deux. Détectés par le harnais.

### Next
Refaire un **audit global** de Scribe à la lumière de ces 2 skills (demande d'Allan) +
décider si on forge un 3ᵉ skill « build mobile/app avec Claude Code » depuis V7.

## 2026-06-19 — Étude stratégique 5 agents + audit stack ↔ UX (mode étude) ✅

### Contexte
Avant de reprendre le dev (migrations, etc.), Allan veut cadrer **l'enjeu réel** de
l'app et **l'ICP** : à qui la vendre, quelles fonctionnalités manquent ou sont inutiles,
quels angles marketing. Demande explicite : firecrawl pour une étude chiffrée + 5 agents
spécialisés. **Mode étude assumé : aucun code ni migration touché.**

### Méthode
Cadrage avec Allan : marché **francophone (FR/BE/CH/QC)**, tête de pont laissée libre
aux agents. 4 agents de recherche en parallèle (marketing chiffré · UX/UI · sécurité &
RGPD · psychologie/rétention/ICP), chacun avec firecrawl + la vraie réalité produit.
Puis 1 agent de **vérification adversariale** qui a fact-checké les chiffres porteurs
(sources primaires). Synthèse par moi.

### Verdict (unanime, 4 angles indépendants)
**On assume Route B (équipes en relais 3×8).** Tête de pont : industrie / logistique /
agro-alimentaire / santé, PME 20–150 sal., France d'abord. Le centre de gravité =
**infrastructure de passation** (un rituel métier obligatoire), pas un outil de
transcription optionnel. Créneau réellement vide (personne ne combine voix→passation
+ anti-collision + validation humaine + RGPD/UE).

### Vérification — chiffres descendus (à ne pas réutiliser)
- « 50 Md$ de pertes dues aux passations de shift » → FAUX : le chiffre Deloitte mesure
  le **downtime machine non planifié**, pas les passations. À reformuler.
- « 70 % des décisions oubliées en 24h » → sourcing cassé (absent de la source citée).
- « 37,5 % activation / 98 % churn 2 sem. » → blog sans méthodologie.
- Correction : entité IA UE = **Anthropic Ireland Ltd** (pas « PBC US »).
Chiffres solides retenus : collab d'équipe 40,2→85,2 Md$ CAGR 9,7 % (GVR) ; 35 % réunions
improductives (LSE) ; NRR ~101 % 2024 ; CNIL SAN-2024-021 (40 000 €, déc. 2024).

### Audit stack actuelle ↔ recos UX/UI (code réel, preuves fichier:ligne)
- **Déjà solide** : waveform Web Audio réelle (`AudioRecorder.tsx:43-87`), 5 états de
  capture + gestion erreur micro, accusés de lecture « qui/quand », empty states, billing
  hors hub, Manrope + tokens clairs.
- **3 écarts critiques Route B** : (1) **anti-collision ABSENTE** — pas de `task_claims`,
  pourtant listée « cœur » dans `brief-produit.md` → **dérive doc↔code** ; (2) invitation
  onboarding **OPTIONNELLE** (`OnboardingWizard.tsx:95`) alors que l'activation
  multi-utilisateur en 24-48h est le levier de rétention n°1 ; (3) **notifications push
  ABSENTES** (pas de SW/Notification API).
- **Écarts moyens** : passation = 3 sections H2 LLM non stylisées en zones colorées ;
  dark mode absent (shift de nuit) ; 6 onglets de nav (reco ≤ 5) ; haptique absent,
  bouton 64px (reco ≥ 88px), accusé non sticky.
- **Conflit capté** : la reco UX d'**auto-confirmation au compte à rebours** des tâches
  violerait la **règle d'or n°4** (validation humaine obligatoire) → on garde les boutons
  explicites (`TaskValidationCard.tsx:164`). Décision : ne pas l'implémenter.

### Décisions d'Allan (même jour)
- ✅ **Route B VALIDÉE** : « on go Route B ».
- ⏸️ **Pricing reporté** à une session de travail dédiée (ne pas trancher d'ici là).
- ⬜ Restent ouverts : (a) vertical exact dans Route B ; (c) profondeur du socle conformité.
- 📹 **À venir** : Allan enverra des vidéos (`A: "lien"` → skill `regarder-video`) pour
  enrichir les skills/méthodes ; **une fois assimilées, refaire un audit global** du projet.

### Livrable
`docs/etude-strategique.md` (canonique) + `snapshot.md` mis à jour + pointeur dans
`CLAUDE.md`. Direction produit Route B consignée en §8 du doc.

## 2026-06-16 — UltraReview : audit complet + correction de 5 bugs prod ✅

### Contexte
Cinq bugs « confirmés » signalés en prod (`scribe-app-beta.vercel.app`) : 500
« digest » sur plusieurs pages, upload avatar KO, invitation KO, Réglages
inaccessible, clic profil → accueil. Audit systématique du dashboard (lecture de
chaque page, route API, query Supabase) avant toute correction (skill
systematic-debugging : pas de fix sans cause racine).

### Cause racine (commune)
**Schema drift** : les migrations `0006` (onboarding_complete, kind), `0007`
(table `invitations`) et `0010` (`users.color`/`avatar_url` + bucket `avatars` +
policies) ne sont PAS appliquées sur le projet réel `kgbxxzujlubflsvprmef` (le
sandbox Hermes est hors-ligne, et Hermes ne touche jamais le projet réel). Plus
une variable d'env oubliée (`SUPABASE_URL` jamais définie, seul
`NEXT_PUBLIC_SUPABASE_URL` l'est) et `NEXT_PUBLIC_SITE_URL` absente.
Point technique clef : **supabase-js NE LÈVE PAS** sur une colonne inconnue —
il renvoie `{ data:null, error }`. Les `try/catch` autour d'un `await select`
(layout, anciennes « corrections ») étaient donc du **code mort**.

### Corrigé (4 commits séparés)
- **bug1 — 500 « digest »** : le client admin (service_role) lisait
  `process.env.SUPABASE_URL` (undefined sur Vercel) → constructeur en échec au
  rendu. Repli `?? NEXT_PUBLIC_SUPABASE_URL` dans `report/page.tsx` (+ try/catch
  → null → état vide), `lib/reports/actions.ts`, `lib/tasks/actions.ts`,
  `lib/entries/actions.ts`, `api/stripe/webhook/route.ts`. (handover + pipeline
  étaient déjà bons.)
- **bug4/5 — Réglages inaccessible + clic profil → accueil** : `settings/page.tsx`
  sélectionnait `color/avatar_url` → `{error}` → `me=null` → `redirect('/dashboard')`.
  Nouveau `src/lib/user/profile.ts` (`fetchOwnProfile`/`fetchOrgMembers`, lecture
  défensive : tente les colonnes optionnelles, retombe sur les garanties).
  Utilisé dans settings, layout (remplace le try/catch mort → pastille toujours
  rendue) et team (liste jamais vidée par l'absence de colonnes).
- **bug2 — upload avatar « L'envoi a échoué »** : écriture Storage via
  service_role (chemin verrouillé `{uid}/` → isolation identique à la policy),
  `ensureBucket()` crée le bucket s'il manque, repli sur la session sinon ;
  colonne `avatar_url` manquante → `persisted:false` (photo stockée, pas d'erreur
  bloquante). Migration `0010` rendue **idempotente** : `drop policy if exists`
  + `DO/exception` autour des policies `storage.objects` → un échec policies ne
  fait plus ROLLBACK des colonnes `color/avatar_url` ni du bucket.
- **bug3 — invitation KO** : `siteUrl()` retombait sur `http://localhost:3000`
  → repli `NEXT_PUBLIC_SITE_URL ?? VERCEL_URL ?? localhost`. Log d'erreur d'insert
  complet (code/détail/hint) pour distinguer table absente (`42P01`, migration
  0007) d'un refus RLS. Lint bloquant corrigé dans `api/admin/migrate` (`any` +
  var inutilisée).

### Vérifs
`npx tsc --noEmit` propre ; `npm run lint` propre ; `npm run build` vert (23
routes). `npm run check:rls` non rejouable (sandbox hors-ligne, `FATAL XX000`) —
aucune table neuve à `org_id` ajoutée → posture RLS inchangée par construction.

### Reste à faire (ops — Allan, projet réel)
**`supabase db push`** des migrations `0006` + `0007` + `0010` sur
`kgbxxzujlubflsvprmef` : c'est le vrai correctif de bug2 (bucket + colonne
avatar_url) et bug3 (table invitations). Le code est désormais défensif et ne
plante plus en attendant, mais la persistance des avatars et l'émission
d'invitations nécessitent le schéma. Définir aussi `NEXT_PUBLIC_SITE_URL` sur
Vercel (sinon repli `VERCEL_URL`).

## 2026-06-16 — Avatars + couleurs d'équipe + waveform live + fix passation ✅

### Contexte
Quatre demandes utilisateur sur le prototype (`prototype`) : fiabiliser la page
Passation (crash si clé service_role absente/tronquée), donner une identité
visuelle aux membres (photo + couleur distinctive), et rendre l'enregistreur
vocal vraiment réactif (la waveform était une fausse animation en boucle).

### Ajouté
- **Migration `0010_avatars_colors.sql`** : `users.avatar_url` + `users.color`
  (`varchar(7)`), bucket Storage **`avatars`** (public en lecture, écriture
  verrouillée au dossier `{uid}/` — 4 policies), et `handle_new_user()` réécrit
  pour **auto-attribuer une couleur libre** de la palette (admin neuf = 1re
  teinte ; invité = 1re teinte libre dans l'org, `WITH ORDINALITY` pour l'ordre).
  N'ajoute **aucune table neuve** → posture RLS inchangée (règle d'or n°2).
- `src/lib/avatar.ts` — palette AA 8 teintes, `initials()`, contraste
  `textColorOn()`, `isValidMemberColor()` (garde-fou serveur). Palette tenue en
  phase avec le SQL du trigger.
- `src/components/Avatar.tsx` — avatar circulaire réutilisable (photo `next/image`
  ou monogramme coloré), **bordure or 2px** pour les admins.
- `src/components/AvatarUpload.tsx` — cercle 64px cliquable, aperçu `data:` URL
  immédiat, POST vers l'API, spinner pendant l'envoi.
- `src/components/ColorPicker.tsx` — sélecteur 8 couleurs ; teintes prises par
  d'autres membres désactivées (cadenas).
- `src/components/UserMenu.tsx` — pastille de compte 32px en haut à droite du
  dashboard (Réglages / déconnexion), ferme au clic extérieur / Échap.
- `src/app/dashboard/settings/page.tsx` — Réglages : photo + nom + couleur,
  e-mail en lecture seule, déconnexion.
- `src/lib/user/actions.ts` — `updateProfile` (session, RLS `users_update_self`) :
  valide le nom, la couleur (palette fermée **et** libre dans l'org).
- `src/app/api/user/avatar/upload/route.ts` — upload FormData → bucket `avatars`
  (chemin `{uid}/avatar.<ext>`, upsert), met à jour `avatar_url` (URL publique
  anti-cache). Tout par le client de session (pas de service_role).

### Modifié
- `src/app/dashboard/handover/page.tsx` — **bug fix** : tout le bloc client
  admin est isolé dans un `try/catch` ; clé absente (throw) **ou** tronquée
  (erreur de requête) → carte blanche propre « Passation momentanément
  indisponible » au lieu d'un 500.
- `src/components/AudioRecorder.tsx` — **waveform réelle** (Web Audio API :
  `AnalyserNode` + `requestAnimationFrame`). 7 barres pilotées en direct par
  refs DOM (zéro re-render à 60 fps), hauteur ∝ volume, couleur par niveau
  (primary < 50 % / secondary / error > 90 %), repli en 4 bandes en miroir,
  minimum 5 %, transition 100 ms. Nettoyage `AudioContext` à l'arrêt/démontage.
- `src/app/dashboard/team/page.tsx` — membres affichés via `Avatar` (couleur +
  photo + bordure or admin).
- `src/app/dashboard/layout.tsx` — devient async, monte `UserMenu`.
- `src/app/dashboard/page.tsx` — retrait du bouton « Se déconnecter » du header
  (redondant + chevauchait la pastille). `pr-14` pour laisser la place.
- `next.config.ts` — `images.remotePatterns` pour le Storage public Supabase.

### Validations
- `npm run lint` → **propre sur tous mes fichiers** ✓ (restent 1 erreur + 1
  warning **pré-existants** dans `api/admin/migrate/route.ts`, hors périmètre).
- `npm run build` → compile + TS OK, **23 routes** ✓.
- `npm run check:rls` → **non exécutable ici** : le sandbox Supabase
  (`doorjfxqetoawqnvguvz`) ne répond plus (ENOTFOUND). La migration 0010
  n'ajoute aucune table à `org_id` → RLS inchangée par construction. À rejouer
  sur un sandbox/CI vivant après `npm run db:apply`.

### Décision
La couleur est **auto-attribuée** à l'inscription (pas de choix dans le flux
public d'invitation), puis modifiable dans Réglages parmi les teintes libres —
moins de friction, distinction garantie dès la création.

### Branche
`prototype` (commit direct demandé). Pas de PR.

---

## 2026-06-14 — Navigation + dashboard-hub : on relie enfin les modules ✅

### Contexte
Les pages `capture` / `tasks` / `report` / `billing` existaient toutes mais
en **îlots isolés** : aucun lien entre elles, l'accueil (`/dashboard`) ne
pointait vers rien et restait sur l'ancien thème clair. On ne pouvait naviguer
qu'en tapant les URLs. Module manquant le plus évident → la navigation.

### Ajouté
- `src/components/DashboardNav.tsx` — barre de navigation basse fixe,
  mobile-first (`max-w-md`, safe-area iOS). Route active mise en évidence via
  `usePathname` (l'accueil ne s'allume pas sur les sous-routes). Icônes SVG
  inline, aucune dépendance ajoutée. Charte AK (#0A0708 / #F0E8D6 / #A8804D).
- `src/app/dashboard/layout.tsx` — layout commun à tout le dashboard : fond
  sombre du design system + `pb-24` pour réserver l'espace sous la nav fixe.
  La nav est désormais présente sur les 5 pages.

### Modifié
- `src/app/dashboard/page.tsx` — l'accueil devient un **hub** : passé au thème
  sombre (cohérent avec les modules), cartes d'accès rapide vers chaque module,
  synthèse org conservée (plan, minutes restantes, rétention, rôle). Fallback
  « Profil introuvable » re-stylé en sombre.
- `src/lib/reports/actions.ts` — fix de 2 erreurs lint **pré-existantes**
  (Phase 4) qui rendaient la CI rouge : `prefer-const` sur `totalEntries` +
  `any[]` remplacé par un type local `ExtractedTask`.

### Validations
- `npm run lint` → propre ✓
- `npm run build` → compile + TypeScript OK, 13 routes générées ✓
- `npm run check:rls` → **non exécutable ici** (`SUPABASE_DB_URL` absent de
  `.env.local` sur ce poste). Sans impact : ce module est 100 % front, aucune
  migration, aucune table à `org_id` ajoutée → posture RLS inchangée.
- Aucune migration créée → rien à appliquer sur le sandbox.

### Branche
`feat/capture-audio` poussée sur origin. Pas de PR (attente accord Allan).

---

## 2026-06-13 — Phase 5 Billing : abonnements Stripe + quotas ✅

### Ajouté
- `src/app/api/stripe/webhook/route.ts` — webhook Stripe (signature vérifiée via `constructEvent`), client admin service_role. Gère `checkout.session.completed` (lie customer/subscription, statut active, plan déduit du prix Stripe), `customer.subscription.updated` (statut mappé), `customer.subscription.deleted` (canceled).
- `src/lib/billing/actions.ts` — server action `createCheckoutSession(plan)` : vérifie admin, crée/récupère le `stripe_customer_id`, ouvre une Checkout Session (mode subscription, metadata `org_id`), retourne l'URL.
- `src/components/UpgradeButton.tsx` — bouton client (`useTransition`) qui appelle l'action et redirige vers Stripe. Charte AK.
- `src/app/dashboard/billing/page.tsx` — Server Component : plan + statut, quota X/Y minutes avec barre de progression, paliers supérieurs proposés (admin seulement), compteur d'essai (30 j depuis `created_at`), message de fin d'abonnement. Affiche PHASE 5 DONE.
- `supabase/migrations/0005_billing.sql` — colonnes `stripe_customer_id`, `stripe_subscription_id`, `subscription_status` (check trial/active/past_due/canceled/unpaid) + index. RLS héritée d'`organizations` (déjà en place).
- `.env.example` — bloc Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`) + `SUPABASE_URL` (utilisé par le client admin, jusque-là non documenté).

### Corrigé (bugs des fichiers initiaux)
- `searchParams` typé en `Promise` + `await` (convention Next 16, comme login/signup).
- `UpgradeButton` extrait en composant client : l'ancien bouton inline utilisait `window`/`alert` dans un Server Component passé à `<form action>` → cassé.
- `checkout.session.completed` : `line_items` n'est PAS dans le payload → récupéré via `stripe.checkout.sessions.listLineItems` (sinon le plan retombait toujours sur "solo").
- `subscription.status` mappé vers les valeurs autorisées par le check constraint (`trialing`→trial, `incomplete*`→unpaid…) : sinon l'update échouait et Stripe rejouait le webhook en boucle.

### Validations
- `npm run build` → compile + TypeScript OK ✓
- `npm run check:rls` → isolation OK (0005 n'ajoute que des colonnes à `organizations`) ✓
- `npm run db:apply` → 0005 déjà appliquée sur le sandbox ✓
- `npm run lint` → 0 erreur sur les fichiers billing (2 erreurs préexistantes dans `reports/actions.ts`, hors périmètre `feat/billing`)

### Décisions
- Webhook + actions suivent le pattern existant : client admin via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (idem `reports/actions.ts`).
- `/dashboard/billing` protégé par `src/proxy.ts` (Next 16) via `startsWith("/dashboard")` — rien à ajouter. Le webhook `/api/stripe/webhook` passe (seules les routes `/dashboard` sont redirigées).
- Stripe en mode TEST. IDs de prix en placeholder via env (à configurer par Allan).

## 2026-06-13 — Phase 4 Report : rapport du soir et accusés de lecture ✅

### Ajouté
- `src/lib/reports/actions.ts` — server actions `generateReport()` (Claude Haiku synthèse via API Anthropic directe) + `markRead(reportId)` (client session RLS-safe)
- `src/components/ReportCard.tsx` — affichage HTML du rapport, charte AK, liste des lecteurs, bouton "J'ai lu" conditionnel
- `src/components/GenerateReportButton.tsx` — bouton client avec `useTransition`, gestion erreurs, états de chargement
- `src/app/dashboard/report/page.tsx` — Server Component, fetch dernier rapport + accusés via admin client (filtré org_id), état vide ou ReportCard, affiche PHASE 4 DONE

### Validations
- `npm run build` → compile OK, TypeScript OK après export types Report/ReportRead ✓
- `npm run check:rls` → isolation OK, reports avec org_id RLS + policies ✓
- Database déjà en place : tables reports + report_reads avec RLS et policies

### Décisions
- `generateReport` utilise Claude Haiku (modèle medium) pour la synthèse — respect stack IA hybride
- HTML du rapport sans CSS inline, balises simples (h1, h2, p, ul, li, hr)
- `markRead` utilise client session pour insertion RLS-safe dans report_reads
- `reports` utilise admin client avec filtrage org_id (pattern consistant avec tasks)

## 2026-06-13 — Phase 3 Tasks : affichage et validation des tâches extraites

### Ajouté
- `src/lib/tasks/actions.ts` — server action `updateTask(entryId, taskIndex, updates)` via client admin (service_role) ; lecture-modification-écriture du tableau JSONB
- `src/components/TaskCard.tsx` — carte tâche avec badge priorité couleur (haute=#6E1F2C, moyenne=#A8804D, basse=#F0E8D6/obsidienne), assigné, deadline, boutons Valider / Terminé via `useTransition`
- `src/components/TaskList.tsx` — Server Component, groupement par priorité (haute → moyenne → basse), render TaskCard pour chaque tâche
- `src/app/dashboard/tasks/page.tsx` — Server Component, fetch entries avec extracted_tasks_json (RLS org garantie), aplatissement en liste de tâches avec entryId+index, affiche PHASE 3 DONE

### Validations
- `npm run build` → compile OK, TypeScript OK, `/dashboard/tasks` dynamique ✓
- `npm run check:rls` → isolation OK, 0 table à org_id sans RLS ✓

### Décisions
- `updateTask` bypasse la RLS volontairement (admin client) car le token session n'a pas les droits d'écriture JSONB partielle ; la route est serveur-only (`"use server"`)
- `status` et `assignee` sont fusionnés dans le JSONB existant (pas de migration schéma) — évolution possible sans breaking change
- TaskList = Server Component (pas d'interactivité propre), TaskCard = Client Component (useTransition pour les boutons)

## 2026-06-13 — Phase 1 Capture : 4 fichiers construits et validés

### Ajouté
- `src/lib/entries/actions.ts` — server actions `getSignedUploadUrl` (client admin service_role) + `createEntry` (client session + RLS)
- `src/components/AudioRecorder.tsx` — push-to-talk, états idle/recording/recorded/uploading/error, timer, barres animées, preview audio, upload signé
- `src/components/NoteInput.tsx` — textarea min-h-120px + envoi via server action
- `src/app/dashboard/capture/page.tsx` — deux onglets Vocal/Écrit, charte obsidienne/ivoire/bordeaux/or, mobile-first
- Migration `0003_entries.sql` — table entries + bucket audio-uploads + RLS 4 policies (déjà présente, commitée)

### Validations
- `npm run build` → compile OK, `/dashboard/capture` prérendu statique ✓
- `npm run check:rls` → isolation OK, entries avec org_id + 4 policies ✓

### Décisions
- `getSignedUploadUrl` utilise le client admin (service_role) pour générer l'URL signée côté serveur
- Upload audio = PUT direct vers l'URL signée (jamais de passage par le serveur)
- `createEntry` redirige vers `/dashboard/tasks` (Phase 2 à venir)
- Extension `.webm` figée dans le chemin storage même si l'appareil encode en mp4 (bucket accepte les deux)

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

---

## 2026-06-15 — Bugs critiques + quick wins UX (branche `prototype`)

Sur la base de `docs/audit-ux-scribe.md` et `docs/brand-guide-scribe.md`.

✅ **3 bugs critiques corrigés**
- **Fuite cross-org `updateTask`** (`lib/tasks/actions.ts`, règle d'or n°2) :
  le client admin bypassait la RLS sans filtre d'org. Choix : garder le client
  admin (la RLS `entries_update_own` limite à l'auteur seul — incompatible avec
  la coordination où un coéquipier valide la tâche d'un autre) MAIS refiltrer
  lecture ET écriture sur l'`org_id` lu via la session. Fuite fermée, coordination
  intra-org préservée.
- **Statut « fait » invisible** (`lib/reports/actions.ts`) : l'UI écrit
  `validated`/`done`, le rapport testait `status === "fait"` → aucune tâche
  terminée n'était comptée. Harmonisé sur `done`.
- **Notes écrites jamais traitées** (`lib/entries/actions.ts`) : `processEntry`
  n'était lancé que pour l'audio → les notes texte restaient des entrées fantômes.
  Lancé pour audio ET texte. TODO laissé : rendre le pipeline asynchrone (audit niv. 2).

✅ **Quick wins UX**
- **Design system tokenisé** (`app/globals.css`) : tokens Scribe en `@theme`
  Tailwind v4 (marine `--color-ink-*`, cloud, `accent-cyan/blue/deep`, sémantique,
  priorités) + `:root` (rayons, ombres, dégradés signature). Rupture nette avec la
  charte Atelier Klar (obsidienne/bordeaux/or) sur tout le dashboard.
- **Migration palette** : `dashboard/{page,layout}`, `capture`, `tasks`, `report`,
  `billing` + `DashboardNav`, `TaskCard`, `TaskList` passés aux classes Scribe.
- **Contraste nav** (`DashboardNav.tsx`) : onglet actif = `accent-cyan` + barre 3 px
  (plus l'opacité seule) ; inactif = texte secondaire. Fond marine translucide + flou.
- **Empty states utiles** (Tâches, Rapport) : titre + une phrase + CTA d'action.
- **Nettoyage prod** : marqueurs `PHASE 3/4/5 DONE` retirés ; emojis du billing
  (✅⚠️🚨💡⏱️) remplacés par des états colorés sobres.

Vérifs : `tsc --noEmit` et `eslint` propres. Pas de migration SQL (check:rls sans objet).

## 2026-06-15 — Niveau 2 (structurel) + Niveau 3 (vision) (branche `prototype`)

Suite de l'audit UX. Objectif : pipeline async + validation humaine, accusés de
lecture, passation 3×8, onboarding, refonte dashboard, quota réel.

**Migration `0006_validations_onboarding.sql`** (via `/nouvelle-table`)
- `task_validations` (org_id + RLS + 4 policies `current_org_id()`) : trace la
  décision humaine (qui/quand/quoi) — matérialise la règle d'or n°4. La tâche n'a
  pas de PK (JSONB), donc identifiée par `(entry_id, task_index)`, upsert.
- `organizations.onboarding_complete` (bool) ; `reports.kind` (`report|handover`).
- Divergence assumée vs la consigne : pas de table `read_receipts` créée —
  `report_reads` (migr. 0004) couvre déjà l'accusé de lecture, on ne duplique pas ;
  les receipts sur tâche n'ont pas de sens (pas de PK tâche). UI bâtie dessus.

**Structurel**
- **Pipeline asynchrone** (`lib/entries/actions.ts`) : `after()` sort Whisper+Haiku
  du chemin critique → l'utilisateur ne subit plus la latence ; redirect immédiat
  vers `tasks?processing=1` avec indicateur d'état lisible.
- **Boucle de validation Accepter/Modifier/Rejeter** (`TaskValidationCard.tsx`,
  `lib/tasks/actions.ts`) : `validateTask`/`rejectTask`/`completeTask` écrivent le
  statut JSON (affichage) ET tracent dans `task_validations` (attribution non
  falsifiable, `validated_by=auth.uid()` imposé par RLS). « À confirmer » remonte
  en tête de liste.
- **Accusés de lecture chiffrés** (`ReadReceiptList.tsx`) : qui a lu, quand, délai,
  temps moyen avant lecture ; widget sur le dashboard + sur rapport/passation.
- **Passation 3×8** (`/dashboard/handover`, `lib/handover/actions.ts`) : synthèse du
  shift suivant (en cours / à confirmer / décisions du jour) via Sonnet 4.6, stockée
  en `reports` `kind='handover'`, partage des accusés de lecture.

**Vision**
- **Onboarding wizard** (`OnboardingWizard.tsx`, `/dashboard/onboarding`) : 3 étapes
  (nommer l'org → inviter → 1er vocal) ; `onboarding_complete` ; le hub y redirige
  tant que non terminé. Étape « inviter » honnête (invites à jeton à venir, jamais
  de rattachement par org_id brut — règle d'or n°2).
- **Refonte dashboard** (`dashboard/page.tsx`) : quick capture, météo des tâches,
  quota minutes, aperçu passation, grille modules — 100 % tokens Scribe.
- **Quota minutes réel** : le pipeline décompte `minutes_used_this_period` (durée
  Whisper `verbose_json`) — le compteur n'est plus décoratif.

**Corrections de fond**
- **Règle d'or n°5** : synthèse rapport+passation passée de Haiku à **Sonnet 4.6** ;
  extraction passée à **Haiku 4.5** (IDs de modèle à jour).
- **XSS** : sanitizer par liste blanche (`lib/sanitize.ts`) sur le HTML LLM avant
  `dangerouslySetInnerHTML` (rapport + passation).
- **Reste d'Atelier Klar éliminé** du dashboard : `ReportCard`, `NoteInput`,
  `AudioRecorder`, `UpgradeButton`, `GenerateReportButton` migrés aux tokens.

Vérifs : `tsc --noEmit`, `eslint`, `next build` propres (16 routes). `check:rls`
non exécutable sur ce poste (`SUPABASE_DB_URL` absent) — migration conforme au
patron canonique (org_id + RLS + 4 policies), à relancer en CI/sandbox avant merge.

## 2026-06-15 — Invitations d'équipe + page Équipe + nav nettoyée (branche `prototype`)

Activation réelle de l'étape 2 de l'onboarding : on peut désormais inviter des
coéquipiers par **jeton signé** (jamais de rattachement par `org_id` brut —
règle d'or n°1/n°2). Le centre de gravité « coordination » gagne ses acteurs.

**Base**
- **Migration `0007_invitations.sql`** (via patron `/nouvelle-table`) : table
  `invitations` (`org_id`, `email`, `token` UUID v4 unique, `created_by`,
  `status` pending/accepted/revoked, `expires_at` défaut +72 h, `accepted_at`),
  RLS activée + 4 policies cloisonnées `current_org_id()` ; émission/gestion
  **réservées aux admins** (policy `exists(... role='admin')`). Index `org_id` +
  `(org_id, lower(email))`.
- **`handle_new_user()` étendu** (remplace la version 0001) : si le signup porte
  un `invitation_token` valide (pending, non expiré, e-mail identique), l'inscrit
  rejoint l'org du jeton en rôle **`member`** et l'invitation passe `accepted` ;
  sinon repli sur l'inscription normale (org neuve, rôle `admin`). L'org est relue
  depuis `invitations`, **jamais** depuis un `org_id` client.

**API & flux**
- **`POST /api/invites/send`** (admin only) : crée l'invitation par SESSION (RLS
  insert admin → `created_by=auth.uid()` imposé), envoie l'e-mail Brevo
  (`sendInvitationEmail`, non bloquant) et **retourne le lien** (copiable même si
  l'e-mail échoue). Réémet le lien existant si une invitation en attente existe.
- **`GET /api/invites/pending`** (admin only) : invitations en attente non expirées
  de l'org (RLS).
- **`/invite/accept?token=xxx`** : page publique ; valide le jeton côté serveur
  (`service_role`, hors RLS car non-membre), **e-mail verrouillé** sur celui de
  l'invitation, signup → trigger → org auto. Action `acceptInvitation` revalide le
  jeton (défense en profondeur) ; e-mail de confirmation délivré via Brevo comme au
  signup normal.

**Front**
- **`/dashboard/team`** : membres (monogramme, badge rôle, « vous ») + invitations
  en attente (admin, échéance relative + révocation en 2 temps) + `InviteMemberButton`.
- **`InviteMemberButton.tsx`** : feuille remontante (bottom sheet) Scribe (poignée,
  voile, action en bas) ; `AcceptInviteForm.tsx` (e-mail lecté, `useFormStatus`) ;
  `RevokeInviteButton.tsx`.
- **Nav réduite** : `Rapport` sort de la barre basse → `Accueil · Capturer · Tâches ·
  Passation · Équipe`. Rapport reste accessible depuis le hub (module ajouté + Équipe).
- **Onboarding étape 2 active** : le placeholder « bientôt » est remplacé par
  l'`InviteMemberButton` réel.

**Limite connue** : un e-mail déjà inscrit sur Scribe ne peut pas accepter une
invitation (signup refusé) → multi-org pour un même compte = TODO post-MVP.
Le gabarit e-mail (`email/send.ts`) reste en palette Atelier Klar → migration
charte Scribe à faire dans une branche `feat/email-brand` dédiée.

Vérifs : `tsc --noEmit`, `eslint`, `next build` **verts** (20 routes, dont
`/dashboard/team`, `/invite/accept`, `/api/invites/{send,pending}`). `check:rls`
non exécutable ici (`SUPABASE_DB_URL` absent) — `invitations` conforme au patron
(org_id + RLS + 4 policies), à relancer en CI/sandbox avec `0006` avant merge.

## 2026-06-15 — Migration design : thème sombre → clair « Professional Flow » (branche `prototype`)

### Contexte
Le design system Scribe vivait en **thème sombre** (marine `ink-*`, blanc cassé
`cloud-*`, accents cyan/bleu, dégradés). `DESIGN.md` (nouvelle source de vérité,
spec « Corporate Modern + Soft Minimalism ») tranche pour un **thème clair** :
fond `#f7fafd`, cartes blanches flottantes rayon 32px, ombres douces teintées
navy, bleu d'action `#0059bb`, titres Deep Navy `#002b5b`, police **Manrope**.
Objectif de la session : migration complète, **zéro trace du dark**.

### Tokens (Tailwind v4 — config en CSS, pas de `tailwind.config.ts`)
- `src/app/globals.css` réécrit : bloc `@theme` portant les tokens **système
  DESIGN.md §2.2** (surfaces `surface`/`surface-container*`, textes `on-surface*`,
  `outline*`, `primary`/`primary-container`, `secondary` = Deep Navy pour les
  titres, `azure` = Soft Azure pour les boutons secondary, famille `error`).
  Rayons sémantiques `rounded-field` (16px) / `rounded-card` (32px) /
  `rounded-pill`. Ombres `shadow-card` + `shadow-modal` teintées
  `rgba(0,43,91,…)`. Suppression de **tous** les tokens dark (ink/cloud/accent/
  muted/hint/gradient/glow + sémantiques success/warning/danger/prio).
- `src/app/layout.tsx` : **Manrope** chargée via `next/font/google` (graisses
  400→800, variable `--font-manrope`), `body` en `bg-surface text-on-surface`,
  `themeColor` clair `#f7fafd`.

### Composants migrés (28 fichiers UI)
Landing, nav basse (`DashboardNav` — actif `primary` + barre, fond
`surface-container`), `dashboard/layout` (conteneur centré **max 1200px**), les
12 pages dashboard/auth/invite et les 13 composants. Patterns appliqués
partout : **cartes** blanc `rounded-card p-6 shadow-card` ; **boutons primary**
pilule 56px (`h-14 rounded-pill bg-primary text-on-primary`) ; **boutons
secondary** azure sans bordure ; **inputs** sans bordure `bg-surface-container-low
rounded-field focus:ring-primary` ; **états vides** icône 24px `primary` + message
`secondary` ; **erreurs** `error` / conteneur `error-container`. Aucune logique
touchée (server actions, handlers, props intacts). Fan-out via 5 agents
parallèles sur un mapping de tokens autoritatif unique → cohérence garantie.

### Vérifs
`tsc --noEmit`, `eslint`, `next build` **verts** (20 routes). Grep word-boundary :
**zéro** classe dark résiduelle, zéro hex sombre, zéro `var(--gradient-*)` inline.
Avertissement CSS initial (`*/` parasite dans un commentaire de `globals.css`)
corrigé → build sans warning.

### Note
`DESIGN.md` ajouté au repo (source de vérité du design). Le gabarit e-mail
(`email/send.ts`) reste hors périmètre front → toujours TODO `feat/email-brand`.
