# Scribe — Dossier de passation Claude Code

> Document unique pour reprendre le projet Scribe avec Claude Code.
> Lis ceci en premier. ~150 lignes, tout l'essentiel.

---

## 1. LE PRODUIT

**Scribe** — SaaS B2B de coordination d'équipe par notes vocales/écrites.
- Tu parles → l'IA transcrit et extrait des tâches → l'équipe valide, suit, reçoit un rapport de passation.
- Ce n'est PAS un outil de transcription passive. Le centre de gravité = **coordination active**.

**Règles d'or (non négociables) :**
1. Auth = sessions Supabase uniquement. Jamais de token statique.
2. **Isolation stricte par organisation** — RLS sur `org_id` partout.
3. Audio uploadé par URL signée (storage UE), jamais en POST direct.
4. **Validation humaine obligatoire** — l'IA propose, un humain confirme.
5. Stack IA hybride : mini pour transcrire, moyen pour synthèse du soir.

---

## 2. TECHNIQUE

| Élément | Valeur |
|---------|--------|
| **Framework** | Next.js 16 App Router, TypeScript strict |
| **CSS** | Tailwind v4 `@theme` (fichier `globals.css`) |
| **Police** | Manrope (400/500/600/700/800) |
| **Base de données** | Supabase (sandbox `doorjfxqetoawqnvguvz`) |
| **Auth** | Supabase SSR (cookies), `src/lib/supabase/server.ts` |
| **Admin DB** | `src/lib/supabase/service.ts` (service_role, jamais côté client) |
| **Email** | Brevo REST API (`src/lib/email/brevo.ts`) |
| **Paiement** | Stripe (`src/lib/billing/`) |
| **IA** | OpenAI Whisper (transcription), Anthropic Claude (extraction de tâches) |
| **Déploiement** | Vercel → `https://scribe-app-beta.vercel.app` |
| **Git** | `github.com/Allan77bot/scribe-app` (branche `prototype`) |

---

## 3. ARCHITECTURE — FLOW DE DONNÉES

```
Capture (vocal/écrit) → entries → pipeline IA → tasks → validation → reports → handover
                           │                    │            │
                           └─ Supabase Storage  │            └─ task_validations
                                                └─ invitations (email Brevo)
```

---

## 4. ARBORESCENCE CLÉ

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── (auth)/login, signup
│   ├── dashboard/
│   │   ├── page.tsx          # Hub
│   │   ├── capture/          # Audio + texte
│   │   ├── tasks/            # Tâches avec validation
│   │   ├── handover/         # Passation 3×8
│   │   ├── team/             # Équipe + invitations
│   │   ├── settings/         # Profil, avatar, couleur
│   │   ├── report/           # Rapport du soir
│   │   ├── billing/          # Stripe + quotas
│   │   └── onboarding/       # Wizard 3 étapes
│   ├── invite/accept/        # Acceptation d'invitation
│   └── api/
│       ├── invites/send, pending
│       ├── user/avatar/upload
│       ├── stripe/webhook
│       └── auth/confirm      # Brevo email verification
├── lib/
│   ├── supabase/             # server.ts + service.ts
│   ├── email/brevo.ts        # API Brevo
│   ├── billing/              # Stripe + quotas
│   ├── auth/actions.ts       # login/logout/signup
│   ├── entries/actions.ts    # Pipeline d'entrées
│   ├── tasks/actions.ts      # CRUD tâches
│   ├── reports/actions.ts    # Synthèse IA
│   ├── user/profile.ts       # Lecture défensive du profil
│   └── sanitize.ts           # XSS whitelist
├── components/
│   ├── DashboardNav.tsx      # Nav 5 onglets
│   ├── UserMenu.tsx          # Avatar + menu (settings/déco)
│   ├── AvatarUpload.tsx      # Upload photo 64px
│   ├── AudioRecorder.tsx     # Waveform réelle (Web Audio API)
│   ├── InviteMemberButton.tsx
│   └── TaskValidationCard.tsx
agents/                       # Fiches spécialisées pour agents IA
├── frontend.md, backend.md, security.md, review.md, brainstorm.md
migrations/                   # SQL (0001 → 0010)
docs/
├── DESIGN.md                 # Spec design (tokens, composants)
├── brief-produit.md          # Vision, modèles, règles d'or
├── plan-attaque.md           # Roadmap
├── snapshot.md               # État actuel (Fait/En cours/Blocages)
└── historique.md             # Journal daté
```

---

## 5. BASE DE DONNÉES — TABLES (8)

| Table | Rôle |
|-------|------|
| `organizations` | Orgs, plan, quotas minutes |
| `users` | Profils (org_id, role, avatar_url, color) |
| `entries` | Notes vocales/écrites brutes |
| `tasks` | Tâches extraites + statut |
| `invitations` | Jetons UUID 72h |
| `task_validations` | Historique Accept/Modify/Reject |
| `report_reads` | Accusés de lecture |
| `reports` | Synthèses de soir |
| `_scribe_migrations` | Tracking migrations |

**RLS présent sur 7/7 tables avec `org_id`.** Anon bloqué en 401 partout.

---

## 6. ENVIRONNEMENT — VARIABLES REQUISES (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://doorjfxqetoawqnvguvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon sandbox>
SUPABASE_SERVICE_ROLE_KEY=<clé service_role sandbox>
BREVO_API_KEY=xkeysib-... (clé API Brevo)
OPENAI_API_KEY=sk-... (Whisper)
ANTHROPIC_API_KEY=sk-ant-... (Claude extraction)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Sur Vercel :** toutes ces variables sont déjà configurées.

---

## 7. COMMANDES

```bash
npm run dev          # Localhost:3000
npm run build        # Build production
npm run check:rls    # Vérifie RLS sur toutes les tables
npm run db:apply     # Applique les migrations
npm run test:isolation  # Tests d'isolation
```

---

## 8. UTILISER CLAUDE CODE SUR CE PROJET

### Skills installés (appelés via `/nom-skill`)

| Skill | Usage |
|-------|-------|
| `frontend-design` | Création UI, landing pages |
| `vercel-react-best-practices` | Patterns Next.js/React |
| `supabase-postgres-best-practices` | RLS, index, requêtes |
| `security-requirement-extraction` | Audit sécu |
| `superpowers:TDD/debug/plans/...` | Workflow (14 skills) |

### Contexte à donner à Claude à chaque session

```
CONSULTE AGENTS.md, DESIGN.md, snapshot.md, docs/brief-produit.md.
Tu es sur la branche prototype. Code anglais, commentaires français, mobile-first.
```

### Fichiers de référence automatiques
Claude Code lit automatiquement `CLAUDE.md` + `AGENTS.md` au démarrage de session.

---

## 9. ÉTAT ACTUEL (juin 2026)

### ✅ Fonctionnel
- Auth (login/signup), dashboard, capture audio/texte
- Tâches avec validation, invitations équipe
- Page équipe, settings (avatar, couleur)
- Waveform audio réelle (Web Audio API)
- Design "Professional Flow" (clair, Manrope, tokens DESIGN.md)
- Brevo emails (invitations, vérification)
- Stripe billing
- RLS actif partout
- 23 routes, build vert

### ⚠️ À faire (prochaines étapes)
- **Passation** : clé service_role absente → fallback activé, fonctionnel une fois la clé configurée
- **Rapports** : connecter le vrai pipeline IA (OpenAI/Anthropic)
- **Onboarding** : étape 2 active, tester le flow complet
- **Quota minutes** : brancher le compteur réel
- **Emails branded** : template Brevo avec charte DESIGN.md

---

## 10. DÉPLOIEMENT

- **URL** : `https://scribe-app-beta.vercel.app`
- **Dashboard Vercel** : `vercel.com/allan77bots-projects/scribe-app`
- **Git** : push sur `prototype` → Vercel auto-déploie
- **Supabase** : `supabase.com/dashboard/project/doorjfxqetoawqnvguvz`
- **Brevo** : `app.brevo.com` (compte `contact@atelierklar.fr`)
