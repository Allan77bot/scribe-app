# Code Review — Scribe IA

> Checklist et méthodologie de review. Lu par l'agent Review de Claude Code.
> Objectif : aucune fuite cross-org, aucun secret exposé, design conforme,
> branche reviewable. Code en anglais, commentaires/review en français.

## Process

1. Lire le diff complet et lancer les vérifications.
2. Appliquer la checklist (14 points) ci-dessous.
3. Noter tout écart, même mineur, avec un commentaire actionnable.
4. **Bloquer** si : RLS manquant, secret exposé, `org_id` dans une URL,
   `dangerouslySetInnerHTML` non sanitizé, build/test rouge.
5. Résumer en 3 sections : ✅ OK · ⚠️ À corriger · 💡 Suggestions.

```bash
git diff origin/prototype...HEAD          # diff de la branche
npm run lint && npm run build             # qualité — doit être vert
npm run check:rls && npm run test:isolation  # sécurité données — doit être vert
```

## Checklist (14 points)

### Base de données
- [ ] 1. Toute nouvelle table a `org_id` + RLS + 4 policies.
- [ ] 2. `npm run check:rls` vert — zéro table à `org_id` sans RLS.
- [ ] 3. Migrations numérotées, créées via `/nouvelle-table` ou appliquées par `db:apply`.

### Sécurité
- [ ] 4. Aucun `service_role` côté client (pas de `NEXT_PUBLIC_…SERVICE_ROLE_KEY`).
- [ ] 5. `org_id` jamais dans une URL — toujours jeton signé (table `invitations`).
- [ ] 6. `dangerouslySetInnerHTML` → `sanitize()` avant tout HTML LLM.
- [ ] 7. Inputs validés par Zod côté serveur.

### Frontend
- [ ] 8. Mobile-first : `overflow-x:hidden`, aucun débordement à 360px.
- [ ] 9. Zéro `style={{}}` inline — tout en tokens Tailwind.
- [ ] 10. Couleurs/police conformes `DESIGN.md` (pas de dark, pas de slate/gray générique).

### Qualité
- [ ] 11. `npm run lint` + `npm run build` verts (TypeScript strict inclus).
- [ ] 12. `npm run test:isolation` vert — isolation cross-org prouvée.
- [ ] 13. Code en anglais, commentaires en français.
- [ ] 14. Commit conventionnel (`feat:` / `fix:` / `chore:` / `docs:`) + **PR obligatoire**.

## Patterns à vérifier

```tsx
// ✅ RLS automatique — pas de filtre manuel nécessaire en session normale
const { data } = await supabase.from("tasks").select();

// ✅ Jeton signé, pas d'org_id dans l'URL
// /invite/accept?token=550e8400-e29b-41d4-a716-446655440000

// ❌ BLOQUANT — org_id exposé dans l'URL
// /dashboard?org_id=xxx

// ❌ BLOQUANT — HTML LLM non sanitizé
<div dangerouslySetInnerHTML={{ __html: llmOutput }} />
// ✅ Corrigé
<div dangerouslySetInnerHTML={{ __html: sanitize(llmOutput) }} />

// ⚠️ Client admin (service_role) → DOIT refiltrer sur l'org de la session
admin.from("tasks").update(…).eq("org_id", session.org_id);
```

## Gabarit de commentaire

```
[BLOQUANT|⚠️|💡] <fichier>:<ligne> — <problème>
Pourquoi : <règle d'or / impact sécurité ou UX>
Suggestion : <correctif concret>
```

## Workflow Git

- **1 branche = 1 préoccupation**, nommée `feat/` `fix/` `chore/` `docs/`.
- **PR obligatoire**, jamais de push direct sur `main`.
- Ne pas ouvrir de PR sans accord explicite (Allan/Alphime).
- `snapshot.md` réécrit + entrée datée dans `historique.md` en fin de session.
