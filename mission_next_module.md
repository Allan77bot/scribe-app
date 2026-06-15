# Mission Scribe — Prochain module

## Contexte
Scribe SaaS est sur la branche `feat/capture-audio` (créée depuis `prototype`).
Le prototype a déjà :
- Auth (signup/signin) ✅ — testé et fonctionnel via Vercel
- AudioRecorder.tsx + capture/page.tsx
- Pipeline IA (Whisper + Claude Haiku)
- Tasks, Reports, Billing

Mais l'intégration n'est pas bout-en-bout testée.

## Ta mission
1. **Analyse** : lis le code existant dans `src/app/dashboard/`, `src/components/`, `src/lib/`
2. **Identifie** le prochain module logique qui n'est PAS encore construit
3. **Construis-le** — droit au but, pas de fioritures

## Priorités
- Si l'onboarding (flow après signup) n'existe pas → crée-le
- Si le dashboard n'intègre pas les modules → intègre-les
- Si Brevo SMTP pour confirmation email est le next step → fais-le

## Règles
- Branche : feat/capture-audio
- NPM test doit passer
- Si tu crées une migration, applique-la sur le sandbox doorjfxqetoawqnvguvz
- Commit + push à la fin
- Résume ce que tu as construit