-- ════════════════════════════════════════════════════════════════════════
-- Migration 0002 — Durcissement des droits d'exécution des fonctions
-- ────────────────────────────────────────────────────────────────────────
-- Supabase accorde EXECUTE à anon + authenticated par défaut à la création
-- d'une fonction dans public. Le Security Advisor signale (WARN) les fonctions
-- SECURITY DEFINER ainsi exécutables. On restreint au strict nécessaire.
-- ════════════════════════════════════════════════════════════════════════

-- handle_new_user : ne s'exécute QUE comme trigger sur auth.users. Le
-- déclenchement par trigger ne dépend pas du droit EXECUTE du rôle appelant,
-- donc on la verrouille totalement (aucun accès via l'API / RPC).
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- current_org_id : pivot des policies RLS → réservée à 'authenticated'.
-- anon n'appartient à aucune org : on lui retire l'accès. (La WARN restante
-- « authenticated peut exécuter » est inhérente : la fonction est sûre, elle ne
-- renvoie que l'org_id de l'appelant lui-même.)
revoke all on function public.current_org_id() from public, anon;
grant execute on function public.current_org_id() to authenticated;
