# Spec — Assignation & suivi des tâches

> **Date : 2026-06-21.** Validé visuellement avec Allan via la maquette
> `src/app/demo/tasks/` (throwaway). **Branche d'implémentation : `feat/tasks-assignment`.**

## Pourquoi
L'admin doit pouvoir **donner des tâches à son équipe** (briefing du matin / sur la
semaine) et **voir qui fait quoi**. Aujourd'hui l'« assigné » n'est qu'une suggestion
texte de l'IA, non reliée à un vrai membre, et il n'y a pas de création manuelle.

## Décisions tranchées (avec Allan)
- **Attribution par initiales** (prénom+nom → « AM » pour Allan), pas par couleur de
  tâche : la **couleur reste réservée à la priorité** (rouge/navy/bleu). La couleur du
  membre vit **uniquement** sur la pastille avatar à initiales (pas de conflit).
- **Qui peut assigner = réglage admin** : `admin_only` (défaut) ou `everyone`.
- **L'admin crée des tâches à la main** (titre, priorité, assigné, échéance
  aujourd'hui/semaine), en plus des tâches extraites des notes vocales.
- **Admin épinglé en bleu** (couleur de marque) — convention, le reste de la palette
  aux membres. *(mineur, à confirmer à l'implémentation)*
- **Garde-fou** : agrégats seulement, **jamais** de vue « qui n'a PAS fait » /
  name-and-shame (adoption terrain + risque CNIL).

## Fonctionnalités
- **Assigner** une tâche à un vrai membre via un picker (avatars/initiales) → stocke
  un `assignee_id`.
- **Badge initiales** sur chaque tâche (réutilise le monogramme de `Avatar`).
- **Création manuelle** : « + Nouvelle tâche (briefing) » → titre / priorité /
  assigné / échéance (Aujourd'hui · Cette semaine).
- **Filtre par personne** (rangée d'avatars : Tous / par membre).
- **Réglage admin** « Qui peut assigner » dans Réglages → pilote les permissions.

## ⚠️ Décision d'archi à trancher AU DÉBUT de l'implémentation
Les tâches vivent aujourd'hui en **JSONB** (`entries.extracted_tasks_json`,
clé métier `entry_id`+`task_index`). Or :
- une tâche **créée à la main** n'a pas d'`entry` parent → le modèle JSONB est inadapté ;
- l'**assignation à un membre** + le **filtre** + « qui fait quoi » se prêtent mal au JSONB.

Il existe déjà une table **`public.tasks`** (migration `0008` : `assigned_to`, `status`,
`priority`, `due_at`, `validated_by`…) **non utilisée par le flux actuel**.
→ **Reco** : migrer le flux d'assignation/création vers `public.tasks` (réconcilier
avec le pipeline d'extraction qui écrit aujourd'hui le JSONB). À cadrer en début de lot
(c'est le vrai point dur). Alternative court terme : ajouter `assignee_id` dans le JSONB
(plus rapide, mais ne résout pas la création manuelle ni le suivi propre).

## Modèle de données (cible)
- `organizations.assignment_mode text not null default 'admin_only'
  check (assignment_mode in ('admin_only','everyone'))` — modifiable par l'admin
  (la policy `org_update_own_admin` le verrouille déjà → OK règle d'or n°2).
- Tâches reliées à un membre : `assignee_id uuid → public.users(id)` (via `public.tasks`
  de préférence, sinon dans le JSONB).
- Initiales calculées depuis `display_name` (2 premières initiales : « Allan Morjon » → « AM »).

## Permissions (serveur, non contournable)
- Action `assignTask` / `createTask` : autorisée si `role = 'admin'` **OU**
  `org.assignment_mode = 'everyone'`. Vérifié côté **server action** (pas seulement l'UI).
- Changement de `assignment_mode` : **admin only**.

## Definition of Done
- Assigner à un membre marche (picker), badge initiales affiché.
- Création manuelle marche (apparaît dans la liste, assignée, avec échéance).
- Filtre par personne marche.
- Réglage admin appliqué **côté serveur** (un membre ne peut pas assigner si `admin_only`).
- `lint` + `build` + `check:rls` **verts** (+ `test:isolation` si nouvelle table touchée).
- Toute table à `org_id` passe par `/nouvelle-table` (org_id + RLS + policy).

## Hors scope
- Planning/calendrier complet (juste une échéance simple aujourd'hui/semaine).
- Notifications d'assignation (relèvent du Sprint 2 du plan stabilité : canal à valider).
- Vue de surveillance individuelle (interdit).
