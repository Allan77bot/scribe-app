# Prompt de relance — Big audit + décisions + action (ultracode)

> À coller dans une **nouvelle session après `/clear`**, lancée en **ultracode**.
> Ne PAS lancer `/init` avant (ça écraserait le CLAUDE.md routeur). Le contexte vit dans
> CLAUDE.md + snapshot.md + docs/.

---

Ultracode. Projet **Scribe IA** (coordination d'équipe : notes vocales → tâches + passation
entre équipes). ICP tranché = **Route B, équipes en relais 3×8**. On a fini une phase
d'étude (4 skills maison créés) ; **on passe à l'action**.

**0. Contexte — lis d'abord, dans l'ordre, puis reprends sans me réexpliquer :**
`CLAUDE.md` · `snapshot.md` · `docs/etude-strategique.md` · `docs/audit-global.md` ·
`docs/brief-produit.md` (§4-8). Les 4 skills maison sont dans `~/.claude/skills/` :
`design-ui`, `retention`, `claude-code-build`, `ship-mobile-app`.

**1. JUGEMENT PAR SKILL — orchestre un Workflow, 1 agent par skill, en parallèle.**
Chaque agent lit `~/.claude/skills/<skill>/SKILL.md` (+ ses references) et l'applique au
**code réel de `src/`** pour JUGER le projet. Chaque agent rend un verdict structuré :
`{ score sur 10, forces, faiblesses critiques avec preuve fichier:ligne, top 3 actions }`.
- **design-ui** → UI / écrans / dashboard / mobile-first / dark mode (shift nuit).
- **retention** → boucle d'habitude, activation multi-utilisateur, mécaniques, anti-patterns B2B.
- **claude-code-build** → santé de build : isolation RLS par `org_id`, secrets, storage
  policies, tests (`test:isolation`, `check:rls`), dette, **schema drift** (migrations
  0006/0007/0010 non appliquées en prod), gestion du contexte.
- **ship-mobile-app** → chemin mobile : Scribe est une **PWA Next.js** ; juge s'il faut /
  comment aller natif (rester PWA installable vs wrap Capacitor vs Expo) et les gaps.
Puis **vérifie de façon adversariale** chaque faiblesse « critique » (1 agent sceptique par
faiblesse, défaut = réfuter) avant de la retenir. Ne garde que ce qui survit.

**2. BOUCLE DE DÉCISION STRATÉGIQUE — agent loop.**
Pour chaque décision ouverte : fais débattre les options par des agents (pour/contre,
chiffré), fais trancher par un juge, **boucle jusqu'à une reco stable**. Décisions :
- (a) **vertical exact** dans Route B (industrie / logistique / agro / santé) ;
- (b) **pricing** : par-siège vs quota minutes (tension `brief-produit.md` §7) ;
- (c) **profondeur du socle conformité** avant la 1ʳᵉ vente (DPA seul → + audit log → + SSO) ;
- (d) **séquencement des P1** (cf. `docs/audit-global.md`).
Sortie : chaque décision **TRANCHÉE** + justification + implication côté code.

**3. SYNTHÈSE.** Consolide en un **PLAN D'ACTION DÉCIDÉ et séquencé** : branches `feat/`
proposées, dépendances entre lots, *definition of done* par lot. Mets à jour
`docs/audit-global.md`, `snapshot.md`, et ajoute une entrée datée à `historique.md`.

**4. ACTION.** Propose-moi le **lot P1 n°1** et **commence à l'implémenter sur une branche
dédiée** (`feat/<domaine>`). Avance en autopilote, mais **règles non négociables** :
- Jamais coder sur `main`/`prototype` directement → branche `feat/` dédiée.
- Toute table à `org_id` créée via le skill `/nouvelle-table` (org_id + RLS + policy), puis
  `/check-rls` doit être **vert**. Isolation inter-org garantie ou on s'arrête.
- Jamais de secret commité ; jamais de clé `service_role` côté client.
- Mobile-first strict ; copy en voix active.
- `lint` + `build` + tests concernés **verts** avant de dire « fait » (preuve à l'appui).
- **JAMAIS `push` / PR / déploiement sans mon accord explicite.**
- Valide la direction d'un design (1 option recommandée) avant de coder en profondeur.

Sois **exhaustif et adversarial** (ultracode), français, direct. Quand tu bloques, dis-le.
Lance.
