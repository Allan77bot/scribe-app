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
