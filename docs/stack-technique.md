# Stack technique — décisions arrêtées

> Choix d'infrastructure **confirmés avec Allan** (le `CLAUDE.md` impose de
> valider les stacks avant de coder l'infra). Daté du 2026-06-09.
> Le benchmark complet qui a mené à ces choix est résumé plus bas (§3).

---

## 1. Stack retenue

| Couche | Choix | Statut compte |
|---|---|---|
| Front (PWA) | **Next.js** | hébergement déjà possédé |
| Hébergement front | **Vercel** (natif Next.js — tranché 2026-06-10) | possédé |
| Base + Auth | **Supabase** (Postgres + Auth + RLS), **région EU** | possédé |
| Stockage audio | **Supabase Storage**, **URL signées**, EU | inclus Supabase |
| Transcription | **OpenAI `gpt-4o-mini-transcribe`** (~0,003 $/min) | compte IA possédé |
| Extraction JSON | **Claude Haiku 4.5** (`claude-haiku-4-5`) | compte Anthropic possédé |
| Synthèse du soir | **Claude Sonnet 4.6** (`claude-sonnet-4-6`) | compte Anthropic possédé |
| Route IA conforme | **API Anthropic directe + DPA + résidence EU** (tranché 2026-06-10) | compte Anthropic possédé |
| Orchestration | **n8n au début → code (Supabase Edge Functions) à terme** | n8n existant |
| Facturation | **Stripe** | à créer |

### Décisions du 2026-06-10
- **Route IA conforme = API Anthropic directe** (compte déjà possédé). **Confirmée
  non bloquante** : le **DPA est inclus automatiquement** à l'acceptation des
  conditions commerciales (avec SCC pour le transfert UE), **no-training par défaut**
  sur l'API, **rétention 30j par défaut**. **Zéro investissement de départ** — paiement
  à l'usage. Le **Zéro-Rétention (ZDR)** est une option soumise à approbation
  d'Anthropic, à demander plus tard si un client l'exige — pas nécessaire au MVP.
  AWS Bedrock EU = cible future uniquement si un client exige strictement AWS.
- **Modèles : Haiku 4.5** (extraction, le moins cher) + **Sonnet 4.6** (synthèse 1×/j).
- **OpenRouter + DeepSeek = rejetés** : route les données hors UE / fournisseur chinois
  sans adéquation RGPD. Déclarer l'IA dans les mentions légales ne rend pas un modèle
  non conforme légal — chaque sous-traitant doit être conforme (DPA + no-training + SCC).
- **Résidence Supabase EU = différenciateur** : les concurrents (Plaud, Fathom, Otter,
  Fireflies) stockent aux US et se couvrent par DPF/SCC. Notre stockage UE natif est un
  argument de vente, surtout pour la Route B.
- **Hébergement front = Vercel** (natif Next.js).

### ⚠️ Point ouvert restant
- Transcription : pour une conformité EU stricte, envisager **Azure OpenAI EU**
  (même modèle, hébergé UE) plutôt qu'OpenAI direct. Compte Azure déjà possédé.
  → à trancher avant `feat/pipeline`.

---

## 2. Ce que ça change vs le prototype (rappel `docs/analyse-legacy.md`)

- OpenRouter (route les données n'importe où) → **abandonné** au profit de
  Claude EU (Bedrock ou Anthropic+DPA). Règle RGPD du brief §8 respectée.
- Google Sheets → **Postgres Supabase** (permet la RLS par `org_id`).
- POST audio direct au webhook → **URL signée Supabase Storage**.
- `secret_token` en localStorage → **sessions Supabase**.

---

## 3. Benchmark résumé (pourquoi ces choix)

- **Supabase** : seul produit qui réunit Postgres + Auth + Storage + RLS. La RLS
  native = l'isolation par org (brief §8) sans la coder à la main. EU dispo.
- **Supabase Storage d'abord** : URL signées natives, même région que la base,
  zéro intégration en plus. Migrer vers Cloudflare R2 *seulement si* le coût de
  stockage devient un sujet — pas avant.
- **Stack IA hybride confirmée** (brief §7) : Haiku 4.5 (petit, rapide, JSON
  propre) pour extraire ; Sonnet 4.6 (moyen) pour la synthèse 1×/jour. Le
  prototype utilisait déjà Sonnet → continuité de qualité.
- **Transcription mini** : ~0,003 $/min, moitié prix du haut de gamme.
- **n8n gardé au début** : les workflows existent → on va vite. Cible = rapatrier
  la logique dans le code pour supprimer webhooks publics + `secret_token`.
- **Stripe** : standard pour « forfait + quota de minutes » (brief §9).
