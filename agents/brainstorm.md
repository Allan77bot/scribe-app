# Brainstorm & Décision — Scribe IA

> Framework de décision produit et heuristiques. Lu par l'agent Brainstorm
> de Claude Code avant toute proposition d'architecture ou de feature.

## Mission Scribe

Transformer des notes vocales/écrites en **coordination d'équipe** :
tâches suivies, accusés de lecture, rapport de passation automatique.
Ce n'est PAS un outil de transcription, PAS une mémoire passive.

## Personas

| Persona | Besoin principal | Comportement |
|---------|-----------------|--------------|
| **Admin** (Allan) | Déléguer, suivre l'équipe, pas micro-manager | Voix active, actions rapides |
| **Membre équipe** | Savoir quoi faire, quand, pour qui | Clarté, zéro friction |
| **Nouveau membre** | Onboarding fluide, premier vocal rapide | Guidage, pas de jargon |

## Heuristiques de décision

Quand tu hésites entre 2 approches, applique dans cet ordre :

1. **Simple d'abord** — la solution la plus simple qui couvre le besoin. Pas d'over-engineering.
2. **Mobile-first** — si ça marche pas à 360px, c'est mort.
3. **L'IA propose, l'humain valide** — jamais automatiser une décision sans confirmation humaine (règle d'or n°4).
4. **RLS toujours** — si une feature contourne la RLS, c'est un bug, pas une feature.
5. **Session > token** — auth = Supabase session. Jamais d'API key statique.
6. **Petit modèle d'abord** — Haiku pour extraire, Sonnet pour synthétiser. Jamais Opus partout (règle d'or n°5).

## Questions à se poser avant de coder

- Cette feature nécessite-t-elle une nouvelle table ? → `/nouvelle-table`
- Est-ce que ça expose un `org_id` dans l'URL ? → redesign
- Est-ce que ça bypass RLS ? → redesign
- Est-ce que ça marche à 360px ? → si non, repenser le layout
- Est-ce que l'IA prend une décision sans validation humaine ? → ajouter un step de confirmation
- Est-ce que j'utilise le bon modèle IA ? → Haiku pour extraction, Sonnet pour synthèse

## Patterns de feature

### Nouvelle entité de données
```
/nouvelle-table <nom>
→ migration SQL générée
→ RLS + policies
→ type TypeScript
→ composant UI (si besoin)
```

### Nouveau flux IA
```
capture → pipeline.processEntry() → tasks → validation → action
         ↑ transcription         ↑ extraction    ↑ humain
         (Whisper)               (Haiku 4.5)     (UI)
```

### Nouvelle page
```
1. Créer src/app/dashboard/<nom>/page.tsx
2. Ajouter icône DashboardNav
3. Mettre à jour AGENTS.md (routes)
4. Mobile-first, tokens DESIGN.md
```

## Contexte technique (ne pas remettre en question)

- Next.js 16 App Router, Tailwind v4 `@theme`, Supabase SSR
- Design system `DESIGN.md` (« Professional Flow », clair, Manrope)
- RLS partout, `org_id` jamais dans URL
- Brevo = Scribe ONLY, Gmail OAuth = Atelier Klar
