# Brainstorm & Décision — Scribe IA

> Framework de décision produit et heuristiques. Lu par l'agent Brainstorm de
> Claude Code avant toute proposition d'architecture ou de feature. On clarifie
> l'intention AVANT de coder. Code en anglais, réflexion en français.

## Mission Scribe (le cap)

Transformer des notes vocales/écrites en **coordination d'équipe** : tâches
suivies, accusés de lecture, rapport de passation automatique. Ce n'est PAS un
outil de transcription, PAS une mémoire passive. Le centre de gravité est la
**coordination active**. Toute feature se juge à : « est-ce que ça aide une
équipe à se passer le relais sans se marcher dessus ? »

## Personas

| Persona | Besoin principal | Comportement attendu |
|---------|------------------|----------------------|
| **Admin** (Allan) | Déléguer, suivre l'équipe, ne pas micro-manager | Voix active, actions rapides, vue d'ensemble |
| **Membre** | Savoir quoi faire, quand, pour qui | Clarté, zéro friction, mobile |
| **Nouveau membre** | Onboarding fluide, premier vocal rapide | Guidage, pas de jargon, validation guidée |

## Heuristiques de décision (appliquer dans cet ordre)

1. **Simple d'abord** — la solution la plus simple qui couvre le besoin réel.
   Pas d'over-engineering ; on ajoute la complexité quand le besoin est prouvé.
2. **Mobile-first** — si ça ne marche pas à 360px, c'est mort.
3. **L'IA propose, l'humain valide** — jamais d'action automatique (relance,
   escalade) sans confirmation humaine (règle d'or n°4).
4. **RLS toujours** — si une feature contourne la RLS, c'est un bug, pas une feature.
5. **Session > token** — auth = session Supabase. Jamais d'API key statique.
6. **Petit modèle d'abord** — Whisper pour transcrire, Haiku pour extraire,
   Sonnet uniquement pour la synthèse du soir. Jamais le haut de gamme partout.

## Questions à se poser avant de coder

- Nouvelle entité de données ? → `/nouvelle-table <nom>` (org_id + RLS d'office).
- Est-ce que ça expose un `org_id` dans une URL ? → redesign (jeton signé).
- Est-ce que ça bypass la RLS ? → redesign, ou refiltrage explicite + justification.
- Est-ce que ça marche à 360px ? → si non, repenser le layout avant de coder.
- L'IA prend-elle une décision sans validation humaine ? → ajouter un step de confirmation.
- Bon modèle IA pour la tâche ? → coût ≪ valeur, stack hybride respectée.

## Quand dire non (ou « plus tard »)

- Feature qui sort du cap coordination → noter en phase 2, ne pas construire maintenant
  (ex. réservation de salles, intégrations CRM, brief audio TTS).
- Raccourci qui affaiblit une règle d'or → **non**, on s'arrête et on demande à Allan.
- Confirmer avec Allan quelles stacks l'équipe possède **avant** de coder l'infra.

## Patterns de feature (copier-coller le squelette)

### Nouvelle entité de données
```
/nouvelle-table <nom>     # migration SQL : org_id + RLS + 4 policies
→ type TypeScript          # src/lib/<module>/types.ts
→ server action            # src/lib/<module>/actions.ts
→ composant UI (si besoin) # src/components/<Composant>.tsx — tokens DESIGN.md
```

### Nouveau flux IA
```
capture → pipeline.processEntry() → tasks → validation humaine → action
          ↑ Whisper (transcription) ↑ Haiku (extraction)  ↑ Accept/Modify/Reject
                                                            puis Sonnet (synthèse soir)
```

### Nouvelle page
```
1. src/app/dashboard/<nom>/page.tsx  (Server Component par défaut)
2. Ajouter l'onglet dans DashboardNav (5 max)
3. Mettre à jour AGENTS.md (tableau de routage) si pertinent
4. Mobile-first, tokens DESIGN.md, empty state utile
```

## Contexte technique (ne pas remettre en question)

- Next.js 16 App Router, Tailwind v4 `@theme`, Supabase SSR.
- Design system `DESIGN.md` (« Professional Flow » — clair, Manrope, navy/azure).
- RLS partout, `org_id` jamais dans une URL.
- Brevo = Scribe uniquement ; le projet Supabase réel n'est jamais touché par Hermes.
