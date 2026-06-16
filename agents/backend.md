# Backend — Scribe IA

> Architecture serveur, base de données, API, et logique métier.
> Lu par les agents Plan, PlanThink et Build.

## Stack

- **Supabase** (Postgres 15, sandbox `doorjfxqetoawqnvguvz`, EU)
- **Pooler** : `aws-0-eu-west-3.pooler.supabase.com:6543` (IPv4 obligatoire)
- **Next.js API Routes** + **Server Actions**
- **RLS** sur toutes les tables de données
- **Migrations** SQL numérotées dans `supabase/migrations/`

```bash
npm run db:apply        # applique les migrations non exécutées (SUPABASE_DB_URL)
npm run check:rls       # zéro table à org_id sans RLS — doit être VERT
npm run test:isolation  # prouve qu'une org ne lit jamais l'autre (4/4)
# Nouvelle table → /nouvelle-table <nom> (scaffold org_id + RLS + 4 policies)
```

## Clients Supabase

| Fichier | Rôle | Clé | Usage |
|---------|------|-----|-------|
| `src/lib/supabase/server.ts` | SSR cookies | `ANON_KEY` | Server Components, Pages |
| `src/lib/supabase/client.ts` | Browser | `ANON_KEY` | Client Components |
| `src/lib/supabase/service.ts` | Admin bypass RLS | `SERVICE_ROLE_KEY` | Profil auto-réparation |
| `src/lib/supabase/admin.ts` | Migrations SQL | `SERVICE_ROLE_KEY` | Endpoint `/api/admin/migrate` |
| `src/lib/supabase/middleware.ts` | Session refresh | `ANON_KEY` | Middleware Next.js |

## Règle d'or n°2 — Isolation par org_id

Toute table de données DOIT avoir :
1. Colonne `org_id UUID REFERENCES organizations(id)`
2. RLS activée (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`)
3. Policy select/insert/update/delete filtrant sur `org_id = current_org_id()`
4. `/nouvelle-table` scaffold automatiquement tout ça

```sql
-- Pattern canonique (généré par /nouvelle-table)
CREATE POLICY "users_select_own_org" ON table_name
  FOR SELECT USING (org_id = current_org_id());
```

**Jamais** d'`org_id` dans une URL — toujours par jeton signé (invitations) ou session.

## Modules actifs

| Module | Fichier clé | Responsabilité |
|--------|------------|----------------|
| **auth** | `src/lib/auth/actions.ts` | login/signup/logout, sessions |
| **entries** | `src/lib/entries/actions.ts` | capture audio/texte → entry |
| **pipeline** | `src/lib/pipeline/` | transcription Whisper → extraction Haiku |
| **tasks** | `src/lib/tasks/actions.ts` | propositions tâches, updateTask |
| **reports** | `src/lib/reports/actions.ts` | synthèse soir Sonnet 4.6 |
| **handover** | `src/lib/handover/actions.ts` | passation 3×8 |
| **billing** | `src/lib/billing/stripe.ts` | Stripe Checkout + webhook |
| **brevo** | `src/lib/email/brevo.ts` | Emails transactionnels (invitation, confirmation) |
| **invites** | `src/app/api/invites/send` | POST génération jeton UUID v4 |
| **onboarding** | `src/lib/onboarding/` | Wizard 3 étapes |

## Flow de données

```
Audio (URL signée Supabase Storage)
  → /api/entries (POST)
    → entry.status = "pending"
      → pipeline.processEntry()
        → OpenAI Whisper (transcription)
          → Claude Haiku 4.5 (extraction tâches)
            → task_validations (propositions)
              → UI validation humaine (Accept/Modify/Reject)
                → task.status = "done"
                  → reports.generate()
                    → Claude Sonnet 4.6 (synthèse)
```

## API Routes

| Route | Méthode | Auth | Notes |
|-------|---------|------|-------|
| `/api/invites/send` | POST | Session admin | Génère jeton UUID v4 |
| `/api/invites/pending` | GET | Session admin | Invitations en attente |
| `/api/stripe/webhook` | POST | Signature Stripe | Événements billing |
| `/api/auth/confirm` | GET | Token email | Confirmation Brevo |
| `/api/admin/migrate` | POST | `x-admin-key` | Appliquer migrations SQL |

**Pattern** : Server Actions > Route Handlers. Les `/api/*` sont réservées aux
webhooks (Stripe) et aux opérations cross-origin (invitation publique).

## Migrations

```bash
npm run db:apply    # Applique toutes les migrations non exécutées
npm run check:rls   # Vérifie que chaque table avec org_id a RLS + policy
```

Migrations appliquées : 0001 → 0009 (organizations, users, entries, reports,
report_reads, task_validations, invitations, tasks, audio_storage).

## Pièges

- **`updateTask`** : le client admin refiltre sur `org_id` pour éviter la
  fuite cross-org — ne pas supprimer ce filtre.
- **`processEntry()`** : appelé pour audio ET texte maintenant — les notes
  écrites ne doivent plus être ignorées.
- **Statut "done"** : harmonisé — le rapport, l'UI et les tâches utilisent
  tous `done` (plus de `fait`).
- **`dangerouslySetInnerHTML`** : toujours sanitizer avec `src/lib/sanitize.ts`
  (DOMPurify) avant d'afficher du HTML LLM.
