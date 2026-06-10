---
description: Audite que toutes les tables public.* avec org_id ont la RLS activée + au moins une policy. À lancer avant tout commit/PR touchant la base.
allowed-tools: Bash(npm run check:rls)
---

Audite l'isolation par organisation (règle d'or n°2), puis rends compte.

1. Exécute : `npm run check:rls`
2. Si le script échoue (exit ≠ 0) ou marque une table `✗` : l'isolation est
   violée. Liste les tables fautives et propose la migration corrective
   (`alter table ... enable row level security;` + policy
   `using (org_id = public.current_org_id())`). N'invente pas : reprends le
   style de `supabase/migrations/0001_init_auth.sql`.
3. Si tout est `✓` : confirme en une phrase que l'isolation est garantie.

Ne déclare JAMAIS l'isolation OK sans avoir vu la sortie réelle du script.
Si `SUPABASE_DB_URL` n'est pas rempli, dis-le et arrête-toi là.
