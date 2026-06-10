---
description: Scaffold une nouvelle table SQL déjà cloisonnée (org_id + RLS + policy par défaut). Empêche d'oublier l'isolation (règle d'or n°2).
argument-hint: <nom_table> [description des colonnes]
---

Crée une migration pour : **$ARGUMENTS**

Contraintes NON négociables (sinon une org pourrait voir les données d'une autre) :

1. Numérote la migration à la suite dans `supabase/migrations/`
   (regarde les fichiers existants : après `0001_init_auth.sql` → `0002_...`, etc.).
2. La table porte obligatoirement :
   `org_id uuid not null references public.organizations (id) on delete cascade`.
3. `alter table public.<table> enable row level security;`
4. Policies, toutes basées sur le pivot `public.current_org_id()` :
   - SELECT : `using (org_id = public.current_org_id())`
   - INSERT : `with check (org_id = public.current_org_id())`
   - UPDATE : `using (org_id = public.current_org_id()) with check (org_id = public.current_org_id())`
   - DELETE : `using (org_id = public.current_org_id())` (ou réservé aux admins selon le besoin)
5. Index sur `org_id`.
6. Colonnes et noms en **anglais**, commentaires en **français**.
7. Reprends le style et l'en-tête de `supabase/migrations/0001_init_auth.sql`.

Après avoir écrit le fichier :
- Rappelle de lancer `npm run db:apply` puis `/check-rls` (ou `npm run check:rls`).
- Ne marque jamais la tâche finie sans que `/check-rls` soit vert.
