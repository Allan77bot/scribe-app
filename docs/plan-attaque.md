# Plan d'attaque — prêt à coder

> Plan opérationnel pour démarrer le développement. À lire avant d'ouvrir VS Code.
> Décisions figées → voir `snapshot.md` et `docs/stack-technique.md`. Spec → `docs/brief-produit.md`.
> Daté du 2026-06-10.

---

## 0. Prérequis (qui fait quoi avant la 1re ligne)

| # | Tâche | Qui | Bloquant pour |
|---|---|---|---|
| 1 | Créer le **projet Supabase région EU** + récupérer `SUPABASE_URL` / clés (anon + service_role) | Alphime | Appliquer les migrations |
| 2 | **Valider le schéma de données** (`brief §5`) | Alphime | Écrire les tables |
| 3 | Accepter les **conditions commerciales Anthropic** (→ DPA auto) | Allan/Alphime | `feat/pipeline` (pas l'auth) |
| 4 | Rédiger la **politique de confidentialité** (sous-traitants : Anthropic, OpenAI) | Allan | Mise en production |

> Claude Code se connecte à Supabase par API (clés en variables d'environnement,
> jamais commitées). Le code de `feat/auth` peut s'écrire avant que le projet existe ;
> seule l'**application** des migrations attend le projet EU.

---

## 1. `feat/auth` — socle d'isolation (étape 1, débloque tout)

**Objectif :** auth réelle par sessions Supabase + organisations + RLS sur `org_id`
partout. C'est la fondation. Rien d'autre ne part avant (`brief §10.1`).

### Étapes (dans l'ordre)

1. **Squelette Next.js** (App Router, PWA, mobile-first strict : `overflow-x:hidden`).
   - Client Supabase (`@supabase/ssr`), variables d'env, pas de clé `service_role` côté front.
2. **Migrations SQL — tables socle** (`brief §5`, noms de colonnes en anglais) :
   - `organizations` : `id`, `name`, `plan`, `minutes_quota`, `minutes_used_this_period`,
     `retention_days` (rétention variable selon le plan), `created_at`.
   - `users` (profil lié à `auth.users`) : `id`, `org_id`, `email`, `display_name`,
     `role` (`admin` | `member`).
3. **Fonction d'isolation** : `current_org_id()` — renvoie l'`org_id` de l'utilisateur
   courant à partir de `auth.uid()`. C'est le pivot de la RLS.
4. **Policies RLS** : `ENABLE ROW LEVEL SECURITY` sur **toutes** les tables, policy
   « `org_id = current_org_id()` » en lecture/écriture. Une org ne voit JAMAIS une autre
   (règle d'or n°2 / `brief §8`).
5. **Flux d'auth** : inscription → création d'une org (ou rejoindre via invitation) →
   session Supabase. **Jamais de token statique** (règle d'or n°1).
6. **Test d'isolation** : créer 2 orgs, vérifier que l'une ne lit pas les données de
   l'autre. C'est le critère de mise en prod (`brief §8` : si pas garanti, on ne déploie pas).

### Definition of Done
- [ ] Un utilisateur s'inscrit, appartient à une org, ouvre une session.
- [ ] Toutes les tables ont la RLS activée + une policy `org_id`.
- [ ] Test prouvant l'isolation inter-org (org A ne voit rien de org B).
- [ ] Aucune clé `service_role` exposée côté client.

---

## 2. Roadmap des branches suivantes (`brief §10`)

| Branche | Contenu | Dépend de |
|---|---|---|
| `feat/auth` | Auth + organisations + RLS (ci-dessus) | — |
| `feat/capture` | Capture push-to-talk + note écrite, upload audio par **URL signée** EU | auth |
| `feat/pipeline` | Transcription (OpenAI mini) → extraction (**Haiku 4.5**) → `entries` | auth, DPA |
| `feat/tasks` | Gestionnaire de tâches + **validation humaine** + anti-collision | pipeline |
| `feat/rapport` | Rapport quotidien (template WF2) + accusé de lecture | tasks |
| `feat/billing` | Stripe + quotas/compteur de minutes + rétention par plan | tasks |

Une préoccupation = une branche = une PR. PR croisées (Allan ↔ Alphime).

---

## 3. Skills & commandes Claude Code à mettre en place

Pour rendre les règles d'or **mécaniques** plutôt que déclaratives :

| Outil | Rôle |
|---|---|
| **Commande `/nouvelle-table`** | Scaffold une table AVEC `org_id` + RLS activée + policy par défaut. Empêche d'oublier l'isolation (règle d'or n°2). |
| **Commande `/check-rls`** | Audite que **toutes** les tables ont la RLS activée et une policy `org_id`. À lancer avant chaque PR touchant la base. |
| **Hook SessionStart** | Garantir que les tests + le linter tournent dans les sessions Claude Code web. |
| **Checklist `CLAUDE.md`** | Ajouter une section « avant tout commit » (RLS ? clé service_role ? mobile-first ?). |

> Ces fichiers vivent dans `.claude/` (commands) + `.claude/settings.json` (hook).
> À scaffolder au lancement de la session VS Code, avant le code applicatif.

---

## 4. Rappel conventions (`brief §11`)

- Code + colonnes en **anglais** ; commentaires + docs en **français**.
- **Mobile-first strict** sur tout le front.
- Copy UI en voix active (« Marquer comme lu », pas « update read flag »).
- Toute table touchant des données passe par la RLS `org_id`, sans exception.
