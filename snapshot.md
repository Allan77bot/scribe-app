# Snapshot — où on en est

> État **présent** du projet. Ce fichier est **réécrit** à chaque session
> (pas d'historique ici → voir `historique.md`). Conçu pour être copié/collé
> sur Discord lors d'un point d'équipe.

| **Dernière mise à jour :** 2026-06-28 (feat/welcome-images — OG + illustrations onboarding)

> ▶ **REPRISE — PROCHAINE SESSION (après `/clear`)** : **`feat/welcome-images` est TERMINÉE** (carte Open
> Graph + illustrations d'onboarding clair/sombre), **committée en LOCAL, rien poussé**. Le **Supabase payant
> n'est TOUJOURS PAS prêt** → migrations `0013→0014→0015→0016` **attendent**, ne pas s'y attaquer. **À voir
> avec Allan** : (1) **push + PR** des branches locales (feat/welcome-images, fix/failles-securite-high,
> feat/onboarding…) — décision explicite requise ; (2) prochain chantier NON bloqué — **conformité RGPD**
> (le gros trou pour vendre, ~8 %) ou **design/polish**. Détail : entrée **2026-06-28** dans `historique.md`.

**Session 2026-06-28 — `feat/welcome-images` : Open Graph + illustrations d'onboarding (clair/sombre).**
Branche dédiée `feat/welcome-images` (depuis `fix/failles-securite-high`). Concern « images de bienvenue »
choisi par Allan. Brainstorming → spec (`docs/specs/2026-06-27-welcome-images-design.md`) → plan
(`docs/superpowers/plans/2026-06-27-welcome-images.md`). **3 tasks livrées, commits séparés, build 32 routes
vert, rien poussé** : **(T1) Open Graph** (ultracode 6 agents) — `src/app/opengraph-image.tsx` + `twitter-image.tsx`
(Satori 1200×630, dégradé cobalt→marine + accent cyan, logo + slogan « L'IA transforme vos notes en tâches
suivies pour l'équipe. »), bloc `openGraph`/`twitter` + `metadataBase` (`scribe-app-beta.vercel.app`) dans
`layout.tsx`, test e2e `tests/e2e/og-meta.spec.ts`. La review adversariale a rattrapé **3 pièges Next 16/
Turbopack/Satori** (le code littéral du plan ne buildait pas) : `readFile(new URL())` au lieu de `fetch()` sur
`file://`, **2 woff statiques** Manrope (Satori ne gère pas la police variable), `runtime` déclaré localement
(re-export interdit). **(T2/T3) illustrations onboarding** — 4 PNG `public/illustrations/onb-{welcome,ready}-{light,dark}.png`
générés via **Higgsfield (Recraft 4.1, mode vector, palette de marque)** ; composant **`OnboardingHero`** :
2 images/écran, **bascule clair↔sombre via `html[data-theme]`**, illustration **entière** (`object-contain`) sur
fond assorti crème/marine (raccord invisible), micro-anim de révélation. Emojis 👋/🚀 remplacés aux **3 écrans**
(accueil manager + employé, Prêt). **Même dessin clair/sombre** (couleurs adaptées au fond) ; la version claire
de l'accueil a été **recolorée via Gemini** (l'onde était buguée en recolor SVG). **Décisions** : OG = carte de
marque unique (pas d'aperçu invitation perso, reporté) ; slogan mène avec le **but** de l'app (IA + coordination),
la passation = angle marketing plus tard ; **pas de vidéo** dans l'onboarding (perf/time-to-value/mobile) → la
vidéo « intro de lancement » est réservée au **marketing** (branche `feat/marketing-video` plus tard, ~53 crédits
Higgsfield restants). Galère récurrente notée : **cache d'images next/image** (URL `_next/image` figée par le
`sizes` à `w=640`) → contournée en **renommant** les assets (`onb-*`).

_Session précédente :_

**Session 2026-06-27 (suite 3) — reste des failles faisable sans backend (toujours `fix/failles-securite-high`).**
« Tout le reste que tu peux faire » → corrigé en code/migration le max de MEDIUM/LOW. **8 failles corrigées**
(commits séparés, build vert, lint OK) : **AS-21** headers + `poweredByHeader:false` (CSP **vérifiée runtime**,
0 violation ; tests `security-headers` **6/6 verts**) · **AS-11** mdp ≥8 serveur · **AS-13** `display_name`/`org_name`
bornés (signup + trigger **0016**) · **AS-06** `escapeHtml` e-mails · **AS-07** prompt injection (données en
message user + délimiteur aléatoire, rapport/passation/extraction) · **AS-08** `raw_text`/transcript bornés ~12k ·
**AS-15** validation schéma sortie Haiku · **AS-20** sniff magic bytes upload avatar. **Migration `0016`** (clamp
display_name) à appliquer après 0015. **REPORTÉ** (raisons dans `historique.md`) : rate-limit AS-04/05/10/14 +
captcha (besoin Upstash/KV + Turnstile), policies storage AS-09/16/17/19 (RLS non testable + historique emmêlé ;
AS-02 ferme déjà l'exploit), AS-18 (décision produit admin-only), AS-12, AS-19. **Rien poussé.**

_Session précédente :_

**Session 2026-06-27 (suite 2) — correctifs sécurité, 3 failles HIGH (branche `fix/failles-securite-high`).**
Concern : avancer pendant l'attente du Supabase payant → corriger les failles de l'audit, les 3 HIGH
d'abord. Travail d'audit du jour **committé** sur `chore/audit-securite` (`dd34020` suite e2e + `4f95892`
docs), puis branche **`fix/failles-securite-high`** (depuis audit-securite). **3 HIGH corrigées, 3 commits
séparés** : **AS-03** (`85375ad`) — `pipeline/actions.ts` passé en `server-only` (`processEntry` n'est plus
une server action → IDOR fermé) ; **AS-02** (`5354c4b`) — `createEntry` valide `storage_path` (préfixe
`${user.id}/`, rejet `..`) → exfil audio cross-org fermée ; **AS-01** (`63323a7`) — migration **`0015`** :
`revoke update` + `grant update` colonnes profil only (`display_name/color/avatar_url/onboarding_complete`)
→ escalade member→admin via PATCH PostgREST fermée (DO block défensif). `npm run build` ✅ **30 routes**.
AS-01 = migration **à appliquer en prod**. **Rien poussé.** Reste : appliquer `0013→0014→0015` en prod,
vérif backend des 3, puis MEDIUM/LOW (cf. `docs/audit-securite-2026-06-27.md` §ordre recommandé ; AS-21
headers 100% faisable sans backend) + tests de non-régression AS-01/02/03.

_Session précédente :_

**Session 2026-06-27 (suite) — tests Playwright EN DIRECT sur les formulaires (sandbox vivant).**
Pilotage navigateur réel (MCP Playwright) sur `/signup` + `/login`, mobile-first (393px). **Couche client
tout verte** : validation (`minlength=8` bloque vraiment — prouvé par frappe), types/required, `maxLength`
120/80, **zéro overflow**, `?error=`/`?message=` reflétés mais **échappés par React** (pas de XSS).
**Découverte majeure** : l'inscription était **CASSÉE** sur le sandbox — trigger `handle_new_user`
insérait `plan='free'` (invalide pour l'enum `org_plan` → `22P02`), car **migration `0013` non appliquée**.
**Allan a exécuté `0013` en direct → inscription OK end-to-end** (compte+org+admin+couleur, vérifié en
base). **Flux réels** (comptes jetables `@mailinator.com`) : inscription réelle ✅ (→ `confirm-email`) ;
**XSS stocké neutralisé** (org_name `"><img onerror>` + display_name `<b>` rendus en **texte inerte** sur
`/dashboard` — échappement React, couvre AS-13/AS-06) ; **anti-énum. connexion ✅** (réponse identique
e-mail inexistant vs existant+mauvais mdp) ; anti-énum. **inscription ⚠️** générique mais A/B bloqué par
le **rate-limit e-mail GoTrue actif** (mitige AS-04/10). `@example.com`/`@exemple.com` **rejetés** (pas de
MX) ; confirmation e-mail active (`mailer_autoconfirm:false`). **Données de test purgées** (2 comptes
DELETE 200 + 2 orgs 204). **Correctif suite e2e** : helper `uniqueTestEmail()` (domaine MX
`mailinator.com`) → remplace les `@exemple.com` (6 usages : `auth-signup` ×4, `email-rate-limit` ×2),
README + commentaires à jour, `npx playwright test --list` ✅. ⚠️ **`.env.local` est passé un instant sur
la PROD `kgbxxzujlubflsvprmef` → tests REFUSÉS puis corrigé sur le sandbox ; RIEN écrit en prod.** Serveur
dev sur **:3001**. **Rien commité, rien poussé** (modifs : `tests/e2e/` payloads+2 specs+README).

_Session précédente :_

**Session 2026-06-27 — audit sécurité (ultracode, 37 agents) + suite de tests Playwright + plan chiffré.**
Branche dédiée **`chore/audit-securite`** (depuis `feat/onboarding`). **Playwright MCP installé** en
scope user (`~/.claude.json`) — actif au prochain redémarrage de Claude Code. Audit multi-agents 4
dimensions (formulaires d'inscription · prompt injection pipeline IA · isolation RLS · secrets/endpoints)
avec **vérification adversariale** : **32 pistes → 21 confirmées, 11 écartées**. **3 HIGH** : (AS-01)
escalade member→admin via PATCH PostgREST direct (policy `users_update_self` ne protège pas `role`) ;
(AS-02) exfiltration audio cross-org via `storage_path` client non validé ; (AS-03) `processEntry`
server action en `service_role` sans autorisation. + 7 MEDIUM (rate-limit email-bombing, prompt
injection system-prompt, wallet-DoS, etc.) + 11 LOW. **Rapport** : `docs/audit-securite-2026-06-27.md`.
**Suite de tests** : `tests/e2e/` (Playwright, `playwright.config.ts`, `@playwright/test` ajouté) — les
`test.fixme` pointent les `AS-xx` (filet de régression). `tsc`/`lint`/`build` **verts (30 routes)**.
**Plan chiffré** : MVP vendable Route B à **~53%** (moteur ~60-65%, manquent le passage en réel +
conformité + couche commerciale). **Aucun correctif de faille appliqué** (audit only — à trancher avec Allan).
**Rien commité, rien poussé.**

_Session précédente :_
**Phase :** BUILD. **`feat/onboarding` codée** (levier rétention n°1) : onboarding **par-personne**
(migration `0014` : `users.onboarding_complete` — le flag était par-org, donc l'employé invité ne voyait
**jamais** son parcours), wizard **2 parcours** (manager : nommer l'équipe → inviter en lot dédupliqué ;
employé : bienvenue → profil nom+couleur), **mini-tour** + **guide des 6 onglets** (vu une fois, rejouable).
Route déplacée `/dashboard/onboarding` → **`/onboarding`** (plein cadre, hors chrome dashboard).
Construite en **ultracode** (7 agents : build parallèle + intégration + review adversariale 3 dimensions
→ 18 findings, **les 4 réels traités**). `tsc`/`lint`/`build` **verts (30 routes)** ; `check:rls` non
rejouable ici (DB hors-ligne) mais **aucune table neuve → RLS inchangée**. **3 commits locaux, NON poussés.**
**Topologie** : `main` = squelette ; tout le produit vit sur `feat/design-system` (PR #8) ;
**`feat/onboarding`** (cette branche) et **`feat/capture-orb`** (orbe vocal, autre branche) descendent de
design-system → à intégrer après #8. _NB : cette branche descend de design-system → elle n'a PAS l'orbe ni
l'entrée snapshot « hook-model » de `feat/capture-orb` (réconciliation au merge)._
**Branche active :** `chore/audit-securite` (depuis `feat/onboarding`) — audit + tests + plan, non commité.
_(feat/onboarding : 3 commits locaux non poussés ; feat/design-system = PR #8 ; feat/capture-orb = orbe.)_

> ▶ **PROCHAINES ACTIONS** : (1) **Allan applique en prod, DANS L'ORDRE : `0013` → `0014` → `0015` → `0016`**
> (snapshot DB avant chaque). `0013` = débloque l'inscription (**PROUVÉ : sans elle, toute inscription
> échoue** — enum `org_plan` rejette `plan='free'`) ; `0014` = onboarding par-personne ; `0015` = correctif
> faille **AS-01** (escalade member→admin) ; `0016` = clamp `display_name` (AS-13) ; (2) **review + merge PR #8** ; (3) décider **push + PR** de
> `feat/onboarding` (et `feat/capture-orb`) ; (4) **dette** : policy `inv_insert` (0012) sans `role=admin`
> au niveau DB (défense en profondeur — app déjà protégée applicativement) + contrainte `UNIQUE(org_id,color)`
> (TOCTOU couleur) ; (5) leviers rétention restants : accusé de lecture amplifié, notifs shift entrant (**bloqué** canal).

---

**TL;DR (pour Discord)**

**Session 2026-06-26 — `feat/onboarding` implémentée (ultracode, 7 agents).**
Concern validé par Allan : porter l'onboarding (levier rétention n°1) en auth réelle. **Découverte
d'audit** : le flag d'onboarding était sur l'**org** → un employé invité (org déjà onboardée) ne voyait
**jamais** son parcours. Corrigé en **onboarding par-personne** (migration `0014`, idempotente, backfill
admin-only). Construit en **ultracode** : build parallèle (serveur + mini-tour + guide, fichiers disjoints)
→ intégration → **review adversariale 3 dimensions** (sécurité/RLS, correctness, UI/a11y/vouvoiement) =
**18 findings**, les **4 réels traités** : (1) le guide des onglets s'affichait par-dessus le wizard →
route déplacée `/dashboard/onboarding` → **`/onboarding`** (plein cadre) ; (2) échecs d'invitation
**surfacés** (plus jamais avalés) ; (3) couleurs prises **grisées** dès l'UI ; (4) tap ≥ 44px. Wizard
**2 parcours** (manager nomme + invite en lot dédupliqué ; employé profil nom+couleur), mini-tour + guide
des 6 onglets (vu une fois, rejouable depuis Réglages). Logique d'invitation factorisée (`inviteOne`,
API route + onboarding, **tout session/RLS — zéro fuite cross-org** confirmé par la review). `tsc`/`lint`/
`build` **verts (30 routes)**. **3 commits locaux, non poussés.** **Reste** : appliquer `0013` puis `0014`
en prod (Allan) ; décider push/PR ; dette sécu notée (policy `inv_insert` 0012 sans admin au niveau DB).

_Session précédente :_

**Session clôture design (2026-06-25) — vouvoiement + Branding/ ignoré + PR #8.**
On a bouclé `feat/design-system` : (1) toute la copy passe au **vouvoiement** (`vous` partout —
décision Allan ; c'était déjà la langue du cœur de l'app), 23 fichiers convertis (e-mails inclus),
prompts IA et commentaires exclus ; (2) l'export handoff `Branding/` est **ignoré** (assets déjà
dans `public/`, source = projet Claude Design). Build **30 routes** vert, tsc+lint propres.
Gros constat : la branche portait **tout le produit non poussé** (73 commits, sur le seul disque
local) → **poussée sur GitHub** + **PR #8** vers `main`. Reste : Allan applique `0013` en prod,
puis review/merge de la PR.

_Session précédente :_

**Session design system (2026-06-24) — brand guide → app, Stages 1-4.**
Le design system « Scribe IA » d'Allan (projet Claude Design, importé via DesignSync) est implémenté
sur `feat/design-system` : palette paper chaud + cobalt `#2A4FB0` + **accent cyan `#22D3EE`** (signature
« validé/actif »), **logo officiel** (S angulaire, cobalt + pointes cyan) + favicon/icônes PWA, composants `ui/Button` +
`ui/StatusBadge`, et **re-skin des 5 écrans** (chrome, accueil, capture, passation, équipe) — logique/RLS
intactes, + **dark mode marine** (toggle clair/sombre dans le menu compte, logo S blanc). Build 28 routes
vert, tsc+lint propres, **rien poussé**. Aperçu public : `/demo/ds`. Reste (polish) : normaliser tu/vous, sort de `Branding/`.

_Session précédente :_

**Session design produit (2026-06-21) — onboarding refondu + assignation de tâches.**
Maquettes cliquables construites et **validées** dans un espace démo public sans login
(`/demo`, jetable) : (1) **onboarding fluide** en 2 parcours — **Manager** (nomme l'équipe →
invite direct : « combien êtes-vous » → champs e-mail) et **Employé** (rejoint → nom + couleur),
+ mini-tour des onglets ; (2) **guide « première fois »** qui pointe chaque onglet au 1ᵉʳ lancement ;
(3) **assignation de tâches** par **initiales** (AM/SD…), création manuelle (briefing du matin),
filtre par personne, **réglage admin** « qui peut assigner ». Couleur = priorité (inchangé) ; les
couleurs membre restent sur l'avatar. **2 specs** : `docs/specs/2026-06-21-onboarding.md` +
`...-tasks-assignment.md`. **Rien d'implémenté dans la vraie app** encore (les maquettes `/demo` sont
la référence à porter). `fix/stabilite-prod` (lot stabilité) toujours codé, en attente d'exécution
prod (migration `0013`) + commit.

_Session précédente :_

**Passage à l'ACTION (ultracode) — jugement par skill + décisions stratégiques, 48 agents.**
2 workflows : (1) 1 agent/skill juge le code réel + 1 sceptique/faiblesse (défaut = réfuter) ;
(2) 4 décisions tranchées par débat→juge→challenge→juge final (le challenge a renversé **3 verdicts
sur 4**). **Verdict majeur : le produit est CASSÉ en prod** — schema drift (`task_validations`
0006↔0012 incompatibles → validation humaine plante ; `reports.kind` absent de 0012 → passation KO ;
trigger 0007 régressé par 0012 → invité recrée une org), token statique `scribe-migrate-2026`
(viole RG n°1), perte d'enregistrement vocal si l'upload échoue. Les sceptiques ont **dégradé**
dark mode / focus-visible / temps réel en polish (≠ l'audit du matin). **Décisions** : vertical =
**logistique par défaut, non gelé** (agro descendu, IFS faux en droit) ; pricing = **par-siège** au
lancement (quota = risque fantôme, marge >89 %) — *décision finale = Allan* ; conformité =
**minimale séquencée** ; séquencement = **stabilité d'abord** → lot n°1 `fix/stabilite-prod`.
Détail : `docs/audit-global.md` (recadré) + `docs/etude-strategique.md`.

_Session précédente :_

**Étude stratégique 5 agents : on assume Route B (équipes en relais 3×8).** Tête de
pont = industrie/logistique/agro/santé, PME 20–150 sal., France d'abord. Le centre de
gravité = **infrastructure de passation** (pas transcription). Marché vérifié
(collab d'équipe 40,2 Md$→85,2 Md$ CAGR 9,7 %, SAM Route B francophone ~50 M€/an).
**Audit stack ↔ recos UX** : capture vocale (waveform Web Audio réelle, 5 états),
accusés de lecture et empty states **déjà solides** ; mais **3 écarts critiques** pour
Route B → (1) **anti-collision ABSENTE** (listée « cœur » au brief mais jamais codée),
(2) **invitation onboarding OPTIONNELLE** (devrait être obligatoire = levier rétention
n°1), (3) **notifications push ABSENTES**. Conflit capté : l'auto-confirm des tâches
violerait la règle d'or n°4 → on garde les boutons explicites. Tout est consigné dans
**`docs/etude-strategique.md`**. Aucun code/migration modifié.

_Session précédente :_

**UltraReview : 5 bugs prod corrigés, build vert (23 routes).** Cause racine
commune = **schema drift** (migrations 0006/0007/0010 pas appliquées en prod) +
une variable d'env oubliée. (1) **500 « digest »** : le client admin lisait
`SUPABASE_URL` (absent sur Vercel) → `undefined` → crash au rendu de
`/dashboard/report` et à l'appel des actions report/tasks/entries + webhook
Stripe → repli `?? NEXT_PUBLIC_SUPABASE_URL` partout. (2) **Réglages
inaccessible + « clic profil → accueil »** : `settings` sélectionnait
`color/avatar_url` (colonnes absentes) → supabase renvoie `{error}` (ne lève
pas, le `try/catch` du layout était mort) → `me=null` → redirect accueil →
nouveau helper `lib/user/profile.ts` à lecture défensive (layout + settings +
team). (3) **Upload avatar** : bucket/policies Storage absents → écriture via
service_role (chemin verrouillé `{uid}/`) + création du bucket au besoin ;
0010 rendue idempotente (plus de ROLLBACK des colonnes). (4) **Invitations** :
`siteUrl()` retombait sur `localhost` → repli `VERCEL_URL` ; log d'erreur
d'insert complet (distingue table absente vs RLS). 4 commits séparés, **pas de
PR**. ⚠️ Vrai correctif #2/#3 = `supabase db push` 0006/0007/0010 en prod (ops Allan).

_Session précédente :_

**Les membres ont un visage, et le micro respire.** 4 chantiers : (1) **avatars**
— photo de profil (bucket `avatars` public, upload `{uid}/avatar.<ext>`) +
page **Réglages** + pastille **UserMenu** 32px en haut à droite ; (2) **couleurs
distinctes par membre** — palette AA 8 teintes, auto-attribuée à l'inscription,
modifiable dans Réglages (teintes prises grisées), **bordure or** sur les admins,
affichées sur Équipe ; (3) **waveform réelle** dans l'enregistreur (Web Audio
`AnalyserNode` + `rAF`, 7 barres pilotées par refs, hauteur ∝ volume, couleur par
niveau) ; (4) **fix passation** — `try/catch` autour du client admin → carte
propre au lieu d'un 500 si la clé service_role manque/est tronquée. Migration
**`0010`** (`users.avatar_url`/`color` + bucket + `handle_new_user` couleur auto),
**aucune table neuve** → RLS inchangée. `eslint`/`build` verts (23 routes). Pas de PR.

_Session précédente :_

**Le front passe en clair — design « Professional Flow ».** Migration complète
du thème **sombre → clair** (source de vérité `DESIGN.md`) : Manrope, fond
`#f7fafd`, cartes blanches 32px, boutons primary pilule 56px (`#0059bb`), titres
Deep Navy. Tokens dans `globals.css` (`@theme` Tailwind v4) ; 28 fichiers UI
migrés ; zéro trace du dark. Build vert (20 routes).

_Avant ça :_
**Les invitations d'équipe sont vivantes.** Au-dessus de la boucle de coordination,
on branche les **acteurs** : table `invitations` à **jeton signé** (UUID v4 +
e-mail + expiration 72 h, jamais de rattachement par `org_id` brut — règle d'or
n°1/n°2), **`POST /api/invites/send`** (admin, e-mail Brevo, retourne le lien),
**`GET /api/invites/pending`** (admin), page publique **`/invite/accept?token=`**
(jeton validé serveur, e-mail verrouillé, signup → trigger → org auto en rôle
`member`), page **`/dashboard/team`** (membres + invitations en attente +
révocation) et feuille **InviteMemberButton**. Nav réduite à **Accueil · Capturer ·
Tâches · Passation · Équipe** (Rapport passe au hub). **Onboarding étape 2 activée**.
Migration `0007` (`invitations` + RLS 4 policies + `handle_new_user` étendu).
`tsc`/`eslint`/`next build` verts (20 routes). Pas de PR (attente accord).

_Rappel boucle de coordination (sessions précédentes) : pipeline asynchrone,
validation humaine Accepter/Modifier/Rejeter (`task_validations`), accusés de
lecture chiffrés, passation 3×8, onboarding wizard, dashboard refondu, quota
minutes réel ; règle d'or n°5 réparée, XSS fermé. Migration `0006`._

---

## Fait

- [x] **Forge de 2 skills depuis 4 vidéos (2026-06-19, mode étude)** : skill
  `regarder-video` (Gemini = les yeux) → 4 vidéos design/Claude Code analysées (V7 via
  transcript yt-dlp). Pipeline Forge (2 checkpoints + panel ×2) → **`design-ui`** (craft
  visuel + dashboard, sortie = audit 5 points) et **`retention`** (design comportemental,
  sortie = 3 mécaniques) installés niveau utilisateur. Détail dans `historique.md`.
- [x] **Étude stratégique + audit stack ↔ UX (2026-06-19, mode étude)** : 5 agents
  (marketing chiffré · UX/UI · sécurité/RGPD · psychologie/rétention · vérification
  adversariale) + recherche firecrawl, marché francophone. Verdict unanime : **Route B
  (relais 3×8)**, tête de pont industrie/logistique/agro/santé. ICP, marché (chiffres
  vérifiés), fonctionnalités garder/ajouter/supprimer, angles marketing, design,
  conformité, rétention → consignés dans `docs/etude-strategique.md`. Audit du code
  réel : 3 écarts critiques (anti-collision absente, onboarding invite optionnelle,
  push absentes). **Aucun code ni migration touché.**
- [x] **UltraReview — 5 bugs prod corrigés (2026-06-16, `prototype`)** : audit
  complet du dashboard. (1) bug1 `SUPABASE_URL`→`NEXT_PUBLIC_SUPABASE_URL`
  (repli) dans report/page + reports/tasks/entries actions + webhook Stripe
  (cause du 500 « digest ») ; (2) bug4/5 helper `lib/user/profile.ts` (lecture
  défensive color/avatar_url) dans settings/layout/team → Réglages accessible,
  plus de redirection accueil ; (3) bug2 upload avatar via service_role +
  `ensureBucket` + 0010 idempotente (DO/exception, plus de ROLLBACK des
  colonnes) ; (4) bug3 `siteUrl()` repli `VERCEL_URL` + diagnostic d'insert.
  `tsc`/`eslint`/`build` verts (23 routes). `check:rls` non rejouable (sandbox
  hors-ligne). 4 commits séparés. **À faire côté ops : `supabase db push` des
  migrations 0006/0007/0010 sur le projet réel** (vrai correctif #2/#3). Détail
  dans `historique.md`.
- [x] **Avatars + couleurs d'équipe + waveform live + fix passation (2026-06-16, `prototype`)** :
  migration `0010` (`users.avatar_url`/`color`, bucket Storage `avatars` public,
  `handle_new_user()` auto-attribue une couleur libre) ; lib `avatar.ts` (palette
  AA 8 teintes + contraste) ; composants `Avatar`, `AvatarUpload` (64px),
  `ColorPicker`, `UserMenu` (32px) ; page `/dashboard/settings` ; action
  `updateProfile` (RLS session) ; `POST /api/user/avatar/upload`. Équipe affiche
  avatars colorés + bordure or admin. `AudioRecorder` : waveform Web Audio réelle
  (7 barres rAF, couleur par niveau). Passation : `try/catch` client admin → carte
  propre (plus de 500). `next.config` : remotePatterns Storage. Build vert (23
  routes). **`0010` à appliquer** + `check:rls` à rejouer (sandbox hors-ligne ici).
  Détail dans `historique.md`.
- [x] **Migration design dark → clair « Professional Flow » (2026-06-15, `prototype`)** :
  refonte complète du design system selon `DESIGN.md`. `globals.css` réécrit
  (`@theme` Tailwind v4 : surfaces/on-surface/primary/secondary navy/azure/error,
  rayons `rounded-field`/`rounded-card`/`rounded-pill`, ombres navy `shadow-card`/
  `shadow-modal`) ; **Manrope** via `next/font` ; 28 fichiers UI migrés (cartes
  blanches 32px, boutons primary pilule 56px, inputs sans bordure, layout 1200px,
  nav active `primary`). Zéro token dark résiduel. `tsc`/`eslint`/`build` verts
  (20 routes). `DESIGN.md` ajouté au repo. Détail dans `historique.md`.
- [x] **Invitations d'équipe + page Équipe + nav (2026-06-15, `prototype`)** : table
  `invitations` à jeton signé (migration `0007` : org_id + RLS 4 policies admin),
  `handle_new_user()` étendu (jeton valide → rejoint l'org en `member`, sinon org
  neuve admin), `POST /api/invites/send` + `GET /api/invites/pending` (admin only),
  page publique `/invite/accept` (e-mail verrouillé), `/dashboard/team`,
  `InviteMemberButton` (bottom sheet) + `AcceptInviteForm` + `RevokeInviteButton`.
  Nav : Rapport → Équipe (Rapport au hub). Onboarding étape 2 réellement active.
  Build/lint/tsc verts (20 routes). Détail dans `historique.md`.
- [x] **Niveau 2 + niveau 3 (2026-06-15, `prototype`)** : pipeline async (`after()`),
  boucle de validation humaine + table `task_validations` (audit attribué, règle
  d'or n°4), accusés de lecture chiffrés (`ReadReceiptList`), passation 3×8
  (`/dashboard/handover`), onboarding wizard (`/dashboard/onboarding` + `onboarding_complete`),
  refonte dashboard à widgets, quota minutes réel. Fond : règle d'or n°5 (Sonnet 4.6
  synthèse / Haiku 4.5 extraction), sanitizer anti-XSS, fin de l'Atelier Klar sur le
  dashboard. Migration `0006`. Build/lint/tsc verts. Détail dans `historique.md`.
- [x] **Bugs critiques + quick wins UX (2026-06-15, `prototype`)** : (1) `updateTask` ne fuit plus cross-org — client admin conservé pour la coordination mais refiltré strictement sur l'`org_id` de la session ; (2) statut harmonisé `done` partout (le rapport comptait `"fait"`, jamais écrit par l'UI) ; (3) les notes écrites passent enfin dans le pipeline (`processEntry` pour audio **et** texte). UX : design system Scribe tokenisé dans `globals.css` (`@theme` Tailwind v4 — marine/cloud/cyan/blue), rupture avec Atelier Klar sur tout le dashboard ; nav basse à contraste réel (cyan actif + barre, slate inactif) ; empty states utiles (Tâches, Rapport) ; marqueurs `PHASE x DONE` et emojis billing supprimés. tsc + eslint propres. Détail dans `historique.md`.
- [x] **Navigation + dashboard-hub (2026-06-14)** : `DashboardNav.tsx` (barre basse fixe, route active) + `dashboard/layout.tsx` (thème sombre commun + nav sur les 5 pages) + accueil refait en hub avec cartes d'accès rapide. Les modules sont reliés. Lint propre, build OK. Détail dans `historique.md`.
- [x] **Phase 5 Billing (2026-06-13)** : webhook Stripe + `createCheckoutSession` + page billing + migration 0005. Build OK. check:rls vert. `/dashboard/billing` protégé par `proxy.ts`. Stripe en mode TEST, prix en placeholder via env. Détail + bugs corrigés dans `historique.md`.
- [x] **Phase 4 Rapport (2026-06-13)** : 4 fichiers construits (`reports/actions.ts`, `ReportCard.tsx`, `GenerateReportButton.tsx`, `report/page.tsx`). Build OK. check:rls vert. Page `/dashboard/report` : génération via Claude Sonnet 4.6, accusés de lecture RLS-safe, état vide avec bouton de génération.
- [x] **Phase 3 Tasks (2026-06-13)** : 4 fichiers construits (`tasks/actions.ts`, `TaskCard.tsx`, `TaskList.tsx`, `tasks/page.tsx`). Build OK. check:rls vert. Page `/dashboard/tasks` groupée par priorité, Valider/Terminé via server actions admin.
- [x] **Phase 1 Capture (2026-06-13)** : 4 fichiers construits (`actions.ts`, `AudioRecorder.tsx`, `NoteInput.tsx`, `capture/page.tsx`). Build OK. check:rls vert.
- [x] **Recherches SMTP + Transcription tranchées (2026-06-13)** : SMTP → Brevo (France, 9k/mois gratos, Supabase 2 min). Transcription → OpenAI direct (1,80€/mois MVP), Azure EU backup si RGPD client nécessaire.
- [x] **Hermes opérationnel sur le sandbox (2026-06-13)** : cloné le repo, gh auth ADMIN, sandbox Supabase doorjfxqetoawqnvguvz provisionné, .env.local avec mot de passe DB, migrations appliquées (0001 + 0002 déjà à jour), 4/4 test:isolation OK, check:rls vert.
- [x] **Claude Code authentifié** sur le VPS Hermes (compte morjonallan@gmail.com).
- [x] **`main` rattrape tout le projet (2026-06-13)** : fusion fast-forward de `feat/integration-hermes` → `main` (auth + sécurité + migrations + CI + docs Hermes, 14 commits).
- [x] **Socle `feat/auth`** (sessions précédentes) : Next.js 16 PWA + auth sessions Supabase + RLS par org, projet Supabase EU provisionné, isolation prouvée 4/4.
- [x] **Repo poussé sur GitHub** : `main`, `feat/auth`, `feat/integration-hermes`.
- [x] **CI GitHub Actions sans secret** : lint + build + migrations + `check:rls` contre un conteneur `supabase/postgres`.
- [x] **`HERMES.md`** + **`docs/setup-claude-code-vps.md`** + **`docs/briefing-hermes-telegram.md`**.
- [x] **Cockpit Atelier Klar** : login Hermes (♣ vert) déployé sur Netlify.

## En cours / bloqué

- **Lot stabilité — COMMITÉ et intégré à `feat/design-system`** (ancêtre de la branche, commit `7a99220`) :
  migration `0013` idempotente/défensive (réconcilie `task_validations` + `reports.kind` + trigger `0007`),
  `AudioRecorder` (blob persistant IndexedDB, « Réessayer » ne perd plus l'enregistrement, renvoi auto au
  retour réseau), `/api/admin/migrate` (token statique retiré → garde session admin). Inclus dans la **PR #8**.
  ⚠️ **Reste bloqué sur** : exécution de `0013` en prod par Allan (snapshot DB avant) — c'est ACTION 1.
- **Design produit avancé + maquetté (2026-06-21)** : onboarding 2 parcours (manager/employé) + guide
  onglets « première fois » + assignation de tâches construits dans `/demo` (public, sans login,
  **jetable**) et **validés** par Allan. **2 specs** dans `docs/specs/2026-06-21-*.md`. Reste à **porter
  dans la vraie app** (`feat/onboarding`, `feat/tasks-assignment`).
- **Sort des maquettes `/demo` à trancher** : `/demo/*` (onboarding, ds, tasks, dashboard, capture) sont des
  maquettes jetables, publiques sans login. Elles partent dans la PR #8 (routes statiques). À décider avant
  prod : retirer, ou garder derrière un flag de dev. Pas bloquant pour la review.
- **Vidéos assimilées (2026-06-19)** : 4 reçues, 3 analysées en visuel + 1 (cours Claude
  Code) en transcript. **2 skills forgés** (`~/.claude/skills/design-ui` + `retention`).
  **Audit global FAIT** (2026-06-19) → plan priorisé Route B dans `docs/audit-global.md`.
  **Vidéo 7 FAITE** : transcription complète collée → 2 skills forgés (`claude-code-build`
  + `ship-mobile-app`, niveau utilisateur). Panel passe-2 non rejoué sur ces 2 (optionnel).
  4 skills user-level créés ce jour au total : design-ui, retention, claude-code-build, ship-mobile-app.
- **Migrations `0006` + `0007` + `0010` à appliquer** : `npm run db:apply` puis
  `npm run check:rls` (vert) sur un sandbox/CI vivant — **non exécutable ici** :
  le sandbox `doorjfxqetoawqnvguvz` ne répond plus (ENOTFOUND). `0010` ajoute
  `avatar_url`/`color` + bucket `avatars` + couleur auto dans `handle_new_user()` ;
  aucune table neuve → posture RLS inchangée par construction.
- **Limite invitations** : un e-mail déjà inscrit sur Scribe ne peut pas accepter
  une invitation (signup refusé) → multi-org par compte = TODO post-MVP.
- **Gabarit e-mail encore en charte Atelier Klar** (`email/send.ts`) : migrer aux
  tokens Scribe dans une branche `feat/email-brand` dédiée.
- **Reset périodique du quota** : `minutes_used_this_period` est maintenant
  incrémenté, mais pas remis à zéro en début de période (à brancher sur Stripe).
- **Stripe à configurer (Allan)** : produits/prix mode TEST, `STRIPE_*` dans
  `.env.local`, webhook `POST /api/stripe/webhook`.
- **Attente GitHub Pro** pour protection de main (optionnel tant que pas de Vercel).

## Prochaines étapes (par ordre) — déterminées 2026-06-21

**🔴 ACTION 1 — débloquer la prod (Allan, ops).** Exécuter `supabase/migrations/0013_reconcile_drift.sql`
dans le SQL Editor du projet réel `kgbxxzujlubflsvprmef`, **après un snapshot de la base**. Vérifier
ensuite (requêtes en bas du fichier `0013`, ou `POST /api/admin/migrate` connecté en admin). Rejouer
`npm run check:rls` (lecture seule, OK en prod) ; `test:isolation` **uniquement** sur sandbox/CI (il écrit).
→ Tant que ce n'est pas fait, la **validation de tâche** et la **passation plantent** en prod.

**🟠 ACTION 2 — commit + hygiène (Claude, sur OK d'Allan).** Séparer le working tree de `fix/stabilite-prod`
en commits propres : `fix:` (migration `0013` + `AudioRecorder` + route migrate), `docs:` (audit-global,
snapshot, historique, specs). Décider du sort de `/demo` (retirer, ou garder derrière un flag de dev).
**Pas de push/PR sans accord explicite.**

**🟡 ACTION 3 — implémenter `feat/onboarding`** (spec : `docs/specs/2026-06-21-onboarding.md`). Porter les
maquettes `/demo/onboarding` + `/demo/dashboard` dans les vraies pages (auth + Supabase) : parcours
manager/employé selon `role`, multi-invite (Brevo), profil employé (nom+couleur), guide onglets « 1ʳᵉ fois ».

**🟡 ACTION 4 — implémenter `feat/tasks-assignment`** (spec : `docs/specs/2026-06-21-tasks-assignment.md`).
⚠️ **Trancher d'abord l'archi** : JSONB (`entries.extracted_tasks_json`) vs table `public.tasks` (`0008`) —
reco = migrer vers `public.tasks`. Puis : assignation à un membre, badge initiales, création manuelle,
filtre, réglage admin `assignment_mode` (colonne à ajouter sur `organizations`).

**Backlog / plus tard (cf. `docs/audit-global.md`)** :
- **Sprint 2 produit** : notif au shift entrant (canal à valider en discovery) + fix fenêtre UTC + génération auto.
- **Sprint 3** : relance tâches validées (1/cycle) + PWA durcie (serwist) + polish design (tap ≥ 44px, undo, dark mode).
- **Conformité** : socle minimal (DPA + `/conformité` + suppression org) avant 1ʳᵉ vente.
- Anti-collision (`task_claims`) ; gabarit e-mail aux tokens Scribe (`feat/email-brand`) ; reset périodique
  du quota ; avant prod : confirmation e-mail + Stripe live.

## Comment lancer (mémo équipe)

- **Repo** : https://github.com/Allan77bot/scribe-app (privé).
- **Projet Supabase réel** : `scribe` (org Atelier Klar), EU Frankfurt, ref `kgbxxzujlubflsvprmef`. Clés dans `.env.local` (**non commité**, partagé hors-repo). **Hermes n'utilise JAMAIS ce projet** → sandbox dédié (`HERMES.md`).
- `npm install` puis `npm run dev` → http://localhost:3000.
- `npm run build` / `npm run lint` / `npm run test:isolation` / `npm run check:rls`.
- **Page capture** : http://localhost:3000/dashboard/capture (après login).

## Stack technique — TRANCHÉE (détail : `docs/stack-technique.md`)

Next.js 16 + **Vercel** · Supabase (Postgres/Auth/RLS + Storage URL signées, EU)
· transcription OpenAI mini · extraction Claude Haiku 4.5 · synthèse Claude
Sonnet 4.6 · **route IA = API Anthropic directe + DPA EU** · Stripe.

## Organisation équipe (2 devs + 2 agents)

| Acteur | Domaine | Branches types |
|---|---|---|
| ♦ Allan | Valide PR et décisions, pilote Hermes (Telegram/Board) | — |
| ♠ Alphime | **Front** : design, UX/UI, intégration | `feat/design-system`, `feat/capture` (front) |
| ♥ Claude (poste Allan) | **Cœur back-end** : base/RLS, pipeline IA | `feat/auth`, `feat/pipeline` |
| ♣ Hermes (VPS + Claude Code) | **Sandbox/annexe** : recherches, tests, docs, code périphérique — PR only | `feat/*`, `chore/*` (jamais `main`) |

## Décisions tranchées (récentes)

- ✅ **Route B — VALIDÉE par Allan (2026-06-19)** : « on go Route B ». ICP = équipes en
  relais 3×8. Route A = cas « org à 1 shift », secondaire.
- 🟡 **Vertical = LOGISTIQUE/entrepôt par défaut, NON gelé (2026-06-19, ultracode)** : agro
  descendu (différenciateur IFS/HACCP **faux en droit**), santé = vertical 2 (mur HDS). Vrai
  déterminant = **réseau chaud d'Allan** + 5-10 entretiens découverte. À confirmer terrain.
- 🟢 **Conformité = minimale séquencée (2026-06-19, ultracode)** : réparer les bloquants prod
  d'abord (restaure gratis la trace de validation) → socle minimal pur (DPA + /conformité + CGU
  mention IA + suppression org + info salariés, ~3j) → kit CSE à la demande → **purge auto reportée**
  (pas de J+30 deviné). Azure EU/SSO/HDS exclus tant que santé pas tranchée #1.
- 🟢 **Séquencement P1 = stabilité d'abord (2026-06-19, ultracode)** : Sprint 1 mono-concern
  `fix/stabilite-prod`. Email/notif au shift entrant → Sprint 2 (après discovery du canal).

## Décisions encore ouvertes

- ⏸️ **Pricing** : reco ultracode = **par-siège simple** au lancement (~15-19 €/siège, audio
  fair-use, compteur minutes en garde-fou interne ; marge >89 % → quota = risque fantôme). **MAIS
  décision FINALE = Allan, session dédiée, après preuve d'activation sur 10-20 clients.** Non figé.
- 🟡 **Vertical** : confirmer logistique (ou bascule selon réseau Allan) après 5-10 entretiens.
- 🟡 **Durée de conservation des données** : prérequis AVANT toute auto-purge (ne jamais coder
  une suppression irréversible sur un J+30 deviné).
- 🟡 **Canal de notification du shift entrant** (email vs push PWA vs SMS/WhatsApp vs affichage) :
  à valider par 1 question de discovery à un prospect AVANT de coder le Sprint 2.
- **GitHub Pro** pour la protection mécanique de `main` (cf. En cours).
- **Intégrations CRM/Airtable/Sheets/Notion** : reportées (distraction au stade actuel).

## Décisions tranchées par Hermes

- **SMTP transactionnel** → **Brevo (Sendinblue)** : serveurs Paris, 9k emails/mois gratuits, intégration Supabase 2 min. ✅
- **Transcription** → **OpenAI Whisper API direct** pour le MVP (~1,80€/mois). **Azure OpenAI EU** backup si RGPD client. **Whisper local** trop lourd. ✅
