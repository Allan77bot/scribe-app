# Audit global Scribe — plan d'action priorisé Route B

> **Date : 2026-06-19.** Audit du code réel via les skills `design-ui` (UI/écrans) et
> `retention` (boucle d'habitude), recoupé avec `docs/etude-strategique.md` (ICP Route B)
> et l'audit stack↔UX. **Mode étude : aucun code modifié.** Preuves `fichier:ligne`.

## TL;DR

Le produit a un **bon squelette** (capture vocale soignée, passation, accusés de lecture,
empty states sur tâches/passation). Mais **la boucle de valeur ne se ferme jamais** pour un
nouvel utilisateur, et **le contexte Route B (équipes de nuit, terrain)** n'est pas servi.
Trois leviers débloquent l'essentiel : **invite obligatoire**, **déclencheur de relève**,
**révélation temps réel des tâches**. Plus deux dettes critiques : **dark mode** et
**zones de tap < 44px**.

---

## ⚖️ DÉCISION ultracode (2026-06-19) — ce plan est RECADRÉ

Une passe multi-agents (jugement par skill + vérification adversariale + boucle de décision,
**48 agents**) a **recadré le séquencement ci-dessous**. À lire en priorité ; le détail P1/P2/P3
plus bas reste valable comme *catalogue*, mais l'ORDRE change.

**Découverte majeure que cet audit du matin avait manquée : le produit est CASSÉ en prod.**
- 🔴 **Schema drift `task_validations`** : `0006` (entry_id+task_index+unique) ≠ `0012` (task_id,
  sans unique). Le code upsert sur `entry_id,task_index` → **la validation humaine (RG n°4) renvoie
  une erreur à chaque clic et ne persiste jamais la trace qui/quand.**
- 🔴 **`reports.kind` absent de `0012`** (défini seulement dans `0006`, réputée non appliquée) →
  **insert ET select de passation échouent** si la prod a suivi le chemin `/api/admin/migrate`.
- 🔴 **`0012` a régressé le `handle_new_user` de `0007`** → un invité **recrée une org** au lieu
  de rejoindre la sienne (acceptation d'invitation cassée).
- 🔴 **Token statique `scribe-migrate-2026`** garde un endpoint à privilèges `service_role`
  (viole RG n°1).
- 🔴 **Perte d'enregistrement vocal** si l'upload échoue (« Réessayer » efface le blob).

**Dégradé par la vérification adversariale (≠ priorité de cet audit du matin) :** dark mode (le
skill `design-ui` le classe lui-même en **P3 finition**), focus-visible, contraste AA, collision
0011 / policies storage (bucket **privé** + accès `service_role` → non exploitable), révélation
temps réel des tâches (le locus de valeur = la passation, pas la micro-validation). → **polish**, pas P1.

**Séquencement décidé :**
- **Sprint 1 — `fix/stabilite-prod` (mono-concern) :** ① réconcilier le schema drift
  (`task_validations` + `reports.kind` + trigger 0007) via une `0013` idempotente/défensive ;
  ② fin de la perte d'enregistrement vocal (blob persistant) ; ③ retrait du token statique +
  garde de session. **Rien d'autre.**
- **Sprint 2 :** notif au shift entrant **sur le canal réel** (email vs push PWA vs SMS vs
  affichage — *à valider par discovery, ne pas présupposer l'email*) + fix fenêtre UTC + génération
  auto (cron) + invite obligatoire à l'onboarding.
- **Sprint 3 :** relance sur tâches validées (1/cycle, jamais de name-and-shame) + PWA durcie
  (serwist : service worker + offline + icônes maskable) + polish design (tap ≥ 44px, undo, dark mode).

**Décisions liées :** vertical = **logistique par défaut, non gelé** ; pricing = **par-siège**
au lancement (*décision finale = Allan*) ; conformité = **minimale séquencée** (après Sprint 1).
Détail dans `docs/etude-strategique.md` §9 et `historique.md` (2026-06-19, ultracode).

⚠️ **Mobile : PAS Expo** (PWA Next.js, exclue par le skill `ship-mobile-app`). PWA durcie d'abord,
Capacitor en plan B pour les stores.

---

## P1 — À faire en premier (débloque la valeur + sécurité + usage nuit)

1. **Onboarding : rendre l'invitation d'un collègue NON optionnelle** (ou friction forte
   sur le skip). `OnboardingWizard.tsx` étape 2 dit « Optionnel ». **C'est LE blocage :**
   sans 2ᵉ membre, pas d'accusé de lecture, pas de passation reçue → la valeur cœur
   (coordination) est **impossible à vivre en solo** → churn quasi garanti. Coût ~1h,
   impact maximal. *(retention P1)*
2. **Déclencheur de relève** : à la génération d'une passation, e-mail aux membres du shift
   entrant (Brevo déjà branché pour les invitations) → lien vers `/dashboard/handover`.
   1 e-mail/passation, jamais de relance si déjà lu (`report_reads` le permet). C'est le
   **déclencheur externe récurrent** calé sur le rituel métier (prise de poste) qui manque
   totalement aujourd'hui. *(retention P2 — `lib/handover/actions.ts` + `lib/email/send.ts`)*
3. **Révélation temps réel des tâches après capture** : remplacer « Rechargez dans
   quelques secondes » (`/tasks?processing=1`) par un abonnement Supabase Realtime →
   les tâches apparaissent dès l'extraction. Aujourd'hui la **récompense n°1** (voir ce que
   l'IA a extrait de ta voix) est tuée par un reload manuel. *(retention P3)*
4. **Dark mode** (`prefers-color-scheme` dans `globals.css`) : aucun token sombre
   aujourd'hui → fond blanc cassé **aveuglant pour le shift de nuit** (cœur de Route B).
   *(design P1, tous écrans)*
5. **Zones de tap ≥ 44px** sur les boutons de validation (`TaskValidationCard.tsx` :
   Accepter/Modifier/Rejeter à `min-h-[36px]`, sous le seuil WCAG) — doigts gantés/nuit.
   *(design P1)*
6. **« Rejeter » sans filet** → ajouter un toast « Tâche rejetée — Annuler » (Optimistic
   UI réversible). Action destructive collée à « Accepter » = faux taps en shift. *(design P1)*
7. **Garde-fou anti-surveillance (règle, pas du dev lourd)** : la passation affiche « qui a
   lu / quand » — bien pour la coordination. **Ne JAMAIS** exposer une vue « qui n'a PAS
   lu » / name-and-shame. Agrégat « X/Y ont lu » visible par tous, jamais de pointage
   individuel négatif. Tue l'adoption terrain sinon (et sensible juridiquement). *(retention)*

---

## P2 — Important (cohérence, confiance, lisibilité)

- **Empty states qui montrent la valeur future** : « Météo des tâches » à 0/0/0
  (`dashboard/page.tsx`) et dashboard vide donnent un outil « mort ». Afficher une phrase +
  CTA Capture plutôt que des zéros.
- **Confirmation « Lu ✓ » forte** : après accusé de lecture, badge pill vert + check au lieu
  d'un point 6px discret (`ReportCard.tsx`). L'opérateur entrant veut une preuve nette.
- **Shift label proéminent** dans la passation (info n°1 en 3×8), date secondaire.
- **Nav basse : 6 → 5 items** (`DashboardNav.tsx`) — 6 labels à 10px sont trop denses sur
  375px / gants / nuit. Fusionner Rapport dans Passation, ou icônes seules.
- **Couleurs sémantiques** : priorité « Basse » est en `bg-primary` (bleu = action) →
  confusion ; passer en gris neutre. Waveform : rouge d'**erreur** utilisé pour la
  saturation micro → passer en **ambre** (`AudioRecorder.tsx`).
- **`focus-visible` partout** (au lieu de `focus`) sur inputs/boutons (accessibilité clavier).
- **Player audio custom** : `<audio controls>` natif détonne dans l'UI Manrope.
- **Contraste** : « Passer l'introduction » (`#717786`) ~4.0:1 < AA → assombrir.

---

## P3 / backlog (après validation des P1 sur de vrais users)

- **Anti-collision (`task_claims`)** : toujours **absente** du code alors qu'elle est
  listée « cœur » au brief. Pilier différenciant à construire. *(cf. audit stack)*
- **Service worker + push natif** (VAPID) : pré-requis des notifs à la prise de poste.
  Le manifest PWA existe mais sans SW → app non installable + pas de push.
- **Streak d'ÉQUIPE** (« 14 jours de passation continue ») — jamais individuel
  (infantilisant en terrain).
- **Réglages Route B** : préférence de shift (Matin/AM/Nuit) + préférences de notification.

---

## Ce qui est déjà bon (ne pas casser)
Waveform Web Audio live, gestion d'erreur micro, accusés de lecture avec délai de lecture
(excellente métrique terrain), empty states tâches/passation, sanitizer HTML passation,
avatars colorés, quota en couleur sémantique.

---

## Diagnostic rétention (résumé)
- **Boucle Hook** : déclencheur externe **absent**, récompense n°1 (extraction) **cassée**
  par le reload, investissement **sans valeur perçue en solo**. Se ferme seulement à ≥ 2
  membres actifs.
- **Moment aha réel** = « mon collègue a lu ma passation en 6 min » (pas la transcription).
- **Métrique d'activation proposée** : ≥ 2 membres ont ouvert l'app **et** ≥ 1 passation lue
  par un autre que son créateur, **en 72h** (3 rotations 3×8). < ~20 % = onboarding cassé.

## Lien avec la stratégie
Ce plan sert la **Route B** (cf. `docs/etude-strategique.md`). Les **bloquants commerciaux**
(DPA, page conformité, suppression données) restent listés dans la stratégie §4/§6 — ils
sont orthogonaux à cet audit produit et à traiter avant la 1ʳᵉ vente.
