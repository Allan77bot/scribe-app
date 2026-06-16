# Sécurité — Scribe IA

> Checklist et règles de sécurité obligatoires. Lu par les agents Build et Review.  
> Référence canonique : `docs/brief-produit.md` §8 (règles d'or).

## Checklist avant chaque PR

- [ ] **RLS** : toute nouvelle table a `org_id` + RLS + 4 policies (select/insert/update/delete)
- [ ] **`check:rls` vert** : `npm run check:rls` retourne zéro table sans RLS
- [ ] **Aucun secret côté client** : pas de `NEXT_PUBLIC_` pour clés privées
- [ ] **`service_role` uniquement serveur** : jamais dans un composant ou une API publique
- [ ] **`org_id` jamais dans URL** : toujours par jeton signé (invite → `token UUID`)
- [ ] **`dangerouslySetInnerHTML`** : toujours sanitizer avant (`src/lib/sanitize.ts`)
- [ ] **Input validation** : Zod côté serveur, jamais faire confiance au client
- [ ] **`test:isolation` vert** : `npm run test:isolation` prouve qu'une org ne lit pas l'autre
- [ ] **Pas de token statique** : auth = sessions Supabase uniquement
- [ ] **`.env.local`** : jamais commité, `.gitignore` actif

## Règles d'or résumées

1. **Auth** : sessions Supabase uniquement. Jamais de token statique.
2. **Isolation** : RLS sur `org_id` partout. En cas de doute → stop.
3. **Audio** : URL signée Supabase Storage. Jamais POST direct.
4. **Validation humaine** : l'IA propose, l'humain confirme. Puis timer.
5. **Stack IA** : petit modèle pour transcrire, moyen pour synthétiser.

## Anti-patterns de sécurité

| ❌ À ne jamais faire | ✅ À faire |
|---|---|
| `org_id` dans l'URL | Jeton UUID v4 signé (table `invitations`) |
| `process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | `process.env.SUPABASE_SERVICE_ROLE_KEY` (serveur only) |
| `supabase.from("tasks").select("*")` sans filtre | `.eq("org_id", currentOrgId)` via RLS |
| `dangerouslySetInnerHTML={{ __html: llmOutput }}` | `sanitize(llmOutput)` avant affichage |
| `fetch("/api/data?org_id=xxx")` | `supabase.from("data").select()` → RLS automatique |
| Input utilisateur non validé | `z.object({…}).parse(body)` avant traitement |

## XSS / Injection

- **HTML LLM** : toujours passer par `src/lib/sanitize.ts` (DOMPurify configuré liste blanche)
- **SQL injection** : impossible via Supabase client (requêtes paramétrées)
- **CSRF** : Next.js Server Actions → protection intégrée

## Secrets

- **`SUPABASE_SERVICE_ROLE_KEY`** : jamais commité, jamais côté client, Vercel env var
- **`STRIPE_SECRET_KEY`** : idem
- **`OPENAI_API_KEY`** / **`ANTHROPIC_API_KEY`** : idem
- **`BREVO_API_KEY`** : idem
- **`.firecrawl_key`** : gitignoré, ne pas recréer à la racine
