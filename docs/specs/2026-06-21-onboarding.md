# Spec — Refonte de l'onboarding (manager + employé)

> **Date : 2026-06-21.** Validé visuellement avec Allan via les maquettes `/demo`.
> **Branche d'implémentation : `feat/onboarding`.** Source de vérité UX = les
> maquettes cliquables `src/app/demo/onboarding/` + `src/app/demo/dashboard/`
> (throwaway, à porter dans les vraies pages puis supprimer).

## Pourquoi
L'onboarding actuel (`OnboardingWizard.tsx`) est « trop simplet » et l'invitation
est optionnelle. Or la valeur de Scribe n'existe qu'à **≥ 2 membres** (un collègue
reçoit/lit/valide une passation). On veut un onboarding **plus visuel, fluide, et
qui amène l'invitation au centre** → levier d'activation n°1.

## Décisions tranchées (avec Allan)
- **Deux parcours selon `users.role`** : manager (créateur) vs employé (invité).
- **Idée A** : « combien de membres » = règle le **nombre de champs d'invitation**,
  rien d'autre (pas de structuration de shift).
- **Pas de choix de shift à l'inscription** (les équipes 3×8 tournent → un shift
  figé serait vite faux ; on gérera le shift plus tard, hors onboarding).
- **Friction douce sur le skip** : « Inviter plus tard » volontairement discret,
  PAS de blocage dur (on n'empêche pas d'avancer sans invite).
- **Design** : tokens existants (Manrope, `#0059bb`, cartes blanches), transitions
  fluides, respect de `prefers-reduced-motion`.
- **On garde les 2 explications** (cartes onboarding + guide dashboard) : on passe
  vite, redondance assumée par Allan.

## Parcours

### Manager (créateur — `role = admin`)
1. **Nommer l'équipe** (input → `updateOrgName`).
2. **Inviter** : chips « Vous êtes combien ? » (2→6, règle le nb de champs) +
   champs e-mail dynamiques (+ ajouter / ✕) → CTA « Envoyer N invitations &
   continuer » (envoie N invites) ; « Inviter plus tard » discret.
3. **Mini-tour** : 3 cartes animées (Capturer → Tâches → Passation), points, skippable.
4. **Prêt** → entre dans l'app (`/dashboard`).

### Employé (invité — `role = member`, signup via `invitation_token`)
1. **Bienvenue** : « Tu rejoins *{nom org}*, invité par {admin} » (pas de création).
2. **Ton profil** : `display_name` + **couleur** (palette `lib/avatar.ts`) →
   `updateProfile`.
3. **Mini-tour** (identique).
4. **Prêt** → `/dashboard`.

### Guide « première fois » sur le dashboard (partagé)
À la 1ʳᵉ arrivée : voile sombre + chaque onglet de la barre basse s'allume à tour
de rôle (pastille qui pulse + bulle explicative), pour les **6 onglets**. Affiché
**une seule fois**, bouton « Revoir le guide » pour rejouer.

## Implémentation (pistes)
- **Brancher le wizard sur `role`** (déjà lu dans le profil). Le parcours employé
  s'affiche quand l'utilisateur a rejoint via invitation (role=member).
- **Multi-invite** : boucler sur les e-mails non vides → `POST /api/invites/send`
  (existant). Optionnel : une action batch `sendInvites(emails[])` pour 1 aller-retour.
- **Profil employé** : réutiliser `updateProfile` (display_name + color) + `ColorPicker`.
- **Mini-tour** : composant `OnboardingTour` (cartes + animation CSS, pas de lib).
- **Guide onglets** : composant `FirstRunNavGuide` monté dans `dashboard/layout.tsx`.
  Persistance « vu » : **localStorage** au début (léger, pas de migration ; rejoue
  par appareil — acceptable pour un guide cosmétique). À reconsidérer en colonne
  `users.tour_seen` si on veut le cross-device.
- Respecter mobile-first strict + zones de tap ≥ 44px (corrige aussi le P2 design).

## Definition of Done
- Parcours manager **et** employé fonctionnent de bout en bout en **auth réelle**.
- Les invitations sont réellement envoyées (Brevo) ; le profil employé est enregistré.
- Le guide onglets s'affiche une fois puis plus (et « revoir » marche).
- `lint` + `build` + `test:isolation` + `check:rls` **verts**.
- Mobile-first (rien ne dépasse), `prefers-reduced-motion` respecté.
- `/demo` retiré (ou gardé derrière un flag de dev, à trancher).

## Hors scope (volontaire)
- Choix/structuration des **shifts** à l'inscription.
- **Blocage dur** de l'invitation (on garde la friction douce).
- Illustrations générées (on reste sur icônes lignes).

---

# Décisions d'implémentation — 2026-06-26 (`feat/onboarding`)

> Complète la spec ci-dessus avec les **contrats d'interface figés** (signatures,
> noms de fichiers, props). Validé avec Allan le 2026-06-26. Branche créée depuis
> `feat/design-system`. Sert de référence partagée pour l'implémentation.

## Découverte d'audit — le drapeau d'onboarding était org-level
`organizations.onboarding_complete` est posé **par équipe**. Un employé qui rejoint
une org déjà onboardée serait renvoyé au dashboard → **le parcours employé ne se
déclenchait jamais**. Décision tranchée : **l'onboarding devient par-personne**.

## 1. Migration `supabase/migrations/0014_user_onboarding.sql` (idempotente)
- `alter table public.users add column if not exists onboarding_complete boolean not null default false;`
- Bloc `DO $$ … EXCEPTION WHEN undefined_column THEN NULL; END $$;` qui passe à `true`
  les users dont l'org a déjà `onboarding_complete = true` (le manager existant ne
  revoit pas l'intro). Robuste même si `organizations.onboarding_complete` manque.
- **Aucune table neuve** → RLS de `public.users` inchangée (policies `users_*` déjà
  en place). `check:rls` vert par construction.
- ⚠️ À appliquer en prod **après `0013`** (ops Allan, snapshot DB avant).

## 2. Server actions — `src/lib/onboarding/actions.ts`
Tout par la **session** (RLS), jamais de service_role. Signatures figées :
- `completeOnboarding(): Promise<{ error?: string }>` — écrit `users.onboarding_complete = true`
  pour l'utilisateur courant (plus sur l'org). Policy `users_update_self`.
- `saveOnboardingProfile(name: string, color: string): Promise<{ error?: string }>` —
  valide nom (1–80) + couleur (palette fermée via `isValidMemberColor` **et** libre dans
  l'org), écrit `users.display_name` + `users.color`, **retourne un résultat** (ne redirige
  PAS, contrairement à `updateProfile`). Factoriser la validation « couleur libre » partagée
  avec `lib/user/actions.ts:updateProfile`.
- `sendOnboardingInvites(emails: string[]): Promise<{ results: Array<{ email: string; status: "sent" | "already_member" | "already_invited" | "invalid" | "error" }> }>` —
  **admin only** (vérif `role`), boucle sur les e-mails non vides.

## 3. Factorisation invitation — `src/lib/invitations/service.ts`
Extraire de `src/app/api/invites/send/route.ts` la logique « créer + envoyer une invite »
dans une fonction réutilisable (ex. `inviteOne(supabase, ctx, email)`) qui renvoie le statut.
- L'API route POST appelle `inviteOne` pour 1 e-mail (comportement inchangé côté client).
- `sendOnboardingInvites` appelle `inviteOne` en boucle (1 aller-retour réseau côté UI).
- DRY : zéro duplication de la logique de jeton/Brevo/garde-fous.

## 4. Déclenchement (routing) — défensif
- `src/app/dashboard/page.tsx` : après lecture du profil, `if (!onboarding_complete) redirect("/dashboard/onboarding")`.
  Lecture **défensive** : si la colonne `onboarding_complete` est absente (0014 pas
  appliquée) → considérer `true` (ne PAS imposer l'onboarding sur un schéma pas à jour,
  pas de boucle).
- `src/app/dashboard/onboarding/page.tsx` (refonte) : charge `fetchOwnProfile`
  (`role`, `display_name`, `color`, `org_id`) + nom de l'org + `inviterName` (un admin de
  l'org : `users where org_id=… and role='admin' order by created_at limit 1`). Si
  `onboarding_complete` → `redirect("/dashboard")`. Passe les props au wizard.

## 5. Composants front (porter `/demo/onboarding` + `/demo/dashboard` en réel)
- **`src/components/OnboardingWizard.tsx`** (refonte) — props figées :
  ```ts
  type Props = {
    role: "admin" | "member";
    initialOrgName: string;        // manager : préremplir « nommer l'équipe »
    orgName: string;               // employé : écran bienvenue
    inviterName?: string | null;   // employé : « invité par … »
    displayName: string;           // employé : préremplir profil
    initialColor?: string | null;  // employé : couleur de départ
  };
  ```
  Branche sur `role`. Manager : Nommer l'équipe (`updateOrgName`) → Inviter (chips 2→6 +
  champs e-mail + `sendOnboardingInvites`, « Inviter plus tard » discret). Employé :
  Bienvenue → Profil (`saveOnboardingProfile`, réutiliser `ColorPicker`). Puis
  `OnboardingTour` partagé → écran « Prêt » (`completeOnboarding` → `router.push`).
- **`src/components/OnboardingTour.tsx`** — `{ onDone }: { onDone: () => void }`. Les 3 cartes
  (Capturer/Tâches/Passation), CSS pur, `prefers-reduced-motion` respecté.
- **`src/components/FirstRunNavGuide.tsx`** — client, monté dans `dashboard/layout.tsx`.
  Vu **une seule fois** : localStorage clé `scribe_nav_guide_seen`. Couvre les **6 onglets**
  (Accueil · Capturer · Tâches · Passation · Équipe · Profil). « Revoir le guide » = bouton
  dans Réglages qui efface la clé et revient au dashboard (ou event `window`).

## 6. Definition of Done (rappel + ajouts)
- Parcours manager **et** employé bout-en-bout en auth réelle ; invitations Brevo réelles ;
  profil employé enregistré ; guide une fois (+ « revoir »).
- `npm run lint` + `npm run build` + `npm run check:rls` **verts**. `test:isolation` =
  sandbox/CI uniquement (il écrit, jamais sur la prod).
- Mobile-first strict (rien ne dépasse) ; tap ≥ 44px ; `prefers-reduced-motion`.
- Règles d'or respectées : **session/RLS partout**, **isolation org**, validation humaine
  intacte. Aucune fuite cross-org dans `sendOnboardingInvites`.
- Sort de `/demo` : tranché en fin de branche (retirer ou flag de dev).
