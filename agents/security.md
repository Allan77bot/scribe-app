# Sécurité — Scribe IA

> Checklist et règles de sécurité **non négociables**. Lu par les agents Build
> et Review avant tout commit/PR. Référence canonique : `docs/brief-produit.md`
> §8 (règles d'or). En cas de doute sur l'isolation → **on s'arrête et on demande**.

## Commandes de vérification (copier-coller)

```bash
npm run check:rls        # zéro table à org_id sans RLS — VERT obligatoire
npm run test:isolation   # une org ne lit JAMAIS l'autre (4/4 attendu)
grep -rn "NEXT_PUBLIC_.*SERVICE_ROLE\|NEXT_PUBLIC_.*SECRET" src/  # doit être vide
git ls-files | grep -E "\.env(\.local)?$"   # doit être vide (jamais commité)
```

## Checklist avant chaque PR

- [ ] **RLS** : toute nouvelle table a `org_id` + RLS + 4 policies (select/insert/update/delete).
- [ ] **`check:rls` vert** : `npm run check:rls` retourne zéro table sans RLS.
- [ ] **`test:isolation` vert** : `npm run test:isolation` prouve l'isolation cross-org.
- [ ] **Aucun secret côté client** : pas de `NEXT_PUBLIC_` pour une clé privée.
- [ ] **`service_role` serveur uniquement** : `src/lib/supabase/service.ts`, jamais
      dans un composant ni une route publique.
- [ ] **`org_id` jamais dans une URL** : toujours par **jeton signé** (UUID v4, table
      `invitations`) ou par la session.
- [ ] **HTML LLM sanitizé** : passer par `src/lib/sanitize.ts` avant tout
      `dangerouslySetInnerHTML`.
- [ ] **Validation d'entrée** : Zod côté serveur, jamais faire confiance au client.
- [ ] **Auth = sessions Supabase** : jamais de token statique.
- [ ] **`.env.local`** : jamais commité (`.gitignore` actif).

## Règles d'or résumées (`brief-produit.md` §8)

1. **Auth** : sessions Supabase uniquement. Jamais de token statique.
2. **Isolation** : RLS sur `org_id` partout. En cas de doute → stop.
3. **Audio** : URL signée Supabase Storage UE. Jamais en POST direct via webhook.
4. **Validation humaine** : l'IA propose, l'humain confirme → seulement alors le timer.
5. **Stack IA** : mini pour transcrire, Haiku pour extraire, Sonnet pour synthétiser.

## Anti-patterns de sécurité

| ❌ À ne jamais faire | ✅ À faire |
|---|---|
| `org_id` dans l'URL | Jeton UUID v4 signé (table `invitations`) |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | `process.env.SUPABASE_SERVICE_ROLE_KEY` (serveur) |
| `supabase.from("tasks").select("*")` non filtré | RLS automatique + `.eq("org_id", …)` côté admin |
| `dangerouslySetInnerHTML={{ __html: llmOutput }}` | `sanitize(llmOutput)` avant affichage |
| `fetch("/api/data?org_id=xxx")` | `supabase.from("data").select()` → RLS |
| Input non validé | `z.object({…}).parse(input)` côté serveur |
| Token statique en en-tête | Session Supabase (cookie httpOnly) |

## XSS / Injection

- **HTML LLM** : `src/lib/sanitize.ts` est un **sanitizer par liste blanche**
  maison (sans dépendance — pas de DOMPurify côté serveur). Il retire scripts,
  styles et toute balise/attribut hors liste blanche. **Rapports et passation**
  passent par lui avant injection. Ne jamais faire confiance à une sortie LLM.
- **SQL injection** : impossible via le client Supabase (requêtes paramétrées).
- **CSRF** : Server Actions Next.js → protection intégrée.

## Secrets (tous serveur, jamais `NEXT_PUBLIC_`, jamais commités)

| Secret | Portée | Où |
|--------|--------|----|
| `SUPABASE_SERVICE_ROLE_KEY` | bypass RLS, admin | `.env.local` / Vercel env |
| `STRIPE_SECRET_KEY` | facturation | `.env.local` / Vercel env |
| `ANTHROPIC_API_KEY` | extraction Haiku, synthèse Sonnet | `.env.local` / Vercel env |
| `OPENAI_API_KEY` | transcription Whisper | `.env.local` / Vercel env |
| `BREVO_API_KEY` | emails transactionnels | `.env.local` / Vercel env |

> Seules `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont
> exposables au client — l'`anon key` est protégée par RLS, pas un secret.

## Isolation `org_id` — le rappel central

Une organisation ne voit JAMAIS les données d'une autre. C'est garanti par la
RLS, pas par le code applicatif. Si une feature contourne la RLS (client
`service_role`), elle DOIT refiltrer explicitement sur l'`org_id` de la session
(cf. `updateTask`). Sinon : ne rien mettre en production, demander d'abord.
