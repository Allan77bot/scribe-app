# Code Review — Scribe IA

> Checklist et méthodologie de review. Lu par l'agent Review de Claude Code.

## Process

1. Lire le diff complet (`git diff origin/prototype...HEAD`)
2. Appliquer la checklist ci-dessous
3. Noter tout écart (même mineur) avec un commentaire
4. Bloquer si : RLS manquant, secret exposé, org_id dans URL, `dangerouslySetInnerHTML` non sanitizé
5. Résumer en 3 sections : ✅ OK, ⚠️ À corriger, 💡 Suggestions

## Checklist (14 points)

### Base de données
- [ ] 1. Toute nouvelle table a `org_id` + RLS + policies
- [ ] 2. `check:rls` vert — zéro table avec `org_id` sans RLS
- [ ] 3. Migrations numérotées, appliquées via `/nouvelle-table` ou `db:apply`

### Sécurité
- [ ] 4. Aucun `service_role` côté client (pas de `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`)
- [ ] 5. `org_id` jamais dans une URL — toujours jeton signé
- [ ] 6. `dangerouslySetInnerHTML` → `sanitize()` avant tout affichage HTML LLM
- [ ] 7. Inputs validés (Zod côté serveur)

### Frontend
- [ ] 8. Mobile-first : `overflow-x:hidden`, pas de débordement à 360px
- [ ] 9. Zéro `style={{}}` inline — tout en tokens Tailwind CSS
- [ ] 10. Couleurs / polices conformes DESIGN.md (pas de dark, pas de slate générique)

### Qualité
- [ ] 11. `tsc --noEmit` + `eslint` + `next build` verts
- [ ] 12. `test:isolation` vert (isolation cross-org prouvée)
- [ ] 13. Code en anglais, commentaires en français
- [ ] 14. Commit conventionnel (`feat:` / `fix:` / `chore:` / `docs:`)

## Patterns à vérifier

```tsx
// ✅ OK — RLS automatique
const { data } = await supabase.from("tasks").select()

// ✅ OK — jeton signé, pas d'org_id
// URL: /invite/accept?token=550e8400-e29b-41d4-a716-446655440000

// ❌ BLOQUANT — org_id dans URL
// URL: /dashboard?org_id=xxx

// ❌ BLOQUANT — HTML non sanitizé
<div dangerouslySetInnerHTML={{ __html: llmOutput }} />

// ✅ OK
<div dangerouslySetInnerHTML={{ __html: sanitize(llmOutput) }} />
```

## Workflow Git

- Branche = 1 préoccupation, nommée `feat/` `fix/` `chore/` `docs/`
- PR obligatoire, squash merge dans `prototype`
- Jamais push direct sur `main`
- `snapshot.md` + `historique.md` mis à jour en fin de session
