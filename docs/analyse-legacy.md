# Analyse du prototype `legacy/`

> Décortique le prototype existant (`legacy/`) pour séparer **ce qu'on garde**
> (l'IP : prompts, schéma, format, flux) de **ce qu'on jette** (la plomberie
> Netlify/n8n/Sheets) et **ce qui manque** pour la cible (`docs/brief-produit.md`).
> Daté du 2026-06-09.

---

## 1. Ce que fait le prototype, bout à bout

```
App PWA (index.html, Netlify)
  │  push-to-talk (MediaRecorder) ou note écrite
  │  POST FormData direct → webhook n8n   ⚠️ audio en clair, pas d'URL signée
  ▼
WF1 « Strategist Agent » (webhook transcribeagent)
  → IF vocal/note → transcription OpenAI (HTTP) → AI Agent (gpt-5-mini)
  → JSON structuré → append dans Google Sheets `Scribe_Entrees`
  ▼
WF2 « Transcribe quotidien » (Schedule Trigger, ~20h30)
  → lit Scribe_Entrees du jour + Projets_Memoire
  → IA récap (OpenRouter → claude-sonnet-4.5) → JSON
  → génère email HTML → envoi Gmail
  → prépare propositions de MAJ mémoire → append `Memoire_MAJ_Proposees`
  ▼
WF3 (2 webhooks)
  → GET  memory-pending   : l'app liste les propositions « À valider »
  → POST memory-decision  : Valider/Refuser → applique à `Projets_Memoire`
```

**Constat clé :** la stack IA hybride du brief (`§7`) est **déjà en place** —
mini pour transcrire/extraire (gpt-5-mini), modèle moyen pour la synthèse du
soir (Sonnet 4.5). Et la **logique de validation humaine** (proposition →
approve/reject) existe déjà côté mémoire. C'est exactement l'IP à conserver.

---

## 2. L'IP à conserver (le cerveau) ✅

| Actif | Fichier(s) | Pourquoi on garde |
|---|---|---|
| Prompt d'extraction (WF1) | `agent-prompt-capture.md` | Définit le schéma de champs JSON. Cœur du produit. |
| Prompt de récap (WF2) | `prompt-recap-quotidien.md` (+v2) | Compare entrées du jour ↔ mémoire projet (concordance/contradiction). C'est la valeur ajoutée. |
| Prompt MAJ mémoire (WF3) | `prompt-memory-update.md`, `workflow-3-memory-update.md` | Patch contrôlé + politique `appliquer_auto`/confiance par champ. |
| Règles de validation par champ | `prompt-recap-ajout-memoire.md` | `objectif/stratégie/décisions` → validation humaine obligatoire. |
| Template email | `email-template.html` | `{{date}}` + `{{content_html}}`, mobile-friendly, sobre. |
| Flux UX push-to-talk | `index.html` | MediaRecorder + visualiseur + zéro menu déroulant. Bonne base d'ergonomie. |
| Schéma de champs | `database-schema.md` | Sert de point de départ au mapping ci-dessous. |

> Note pricing : les **3 projets et le pricing CMS/site** vivent en dur dans les
> prompts (`agent-prompt-capture.md`, `projets_memoire_seed.md`). C'est du
> contexte client à **externaliser** (par org), pas à coder en dur. Utile comme
> données de seed/démo.

---

## 3. Mapping schéma : legacy (Google Sheets) → cible (Supabase)

### `Scribe_Entrees` → table `entries`

| Legacy | Cible | Note |
|---|---|---|
| id | `id` | uuid |
| — | **`org_id`** | **À AJOUTER partout** (isolation RLS) |
| date / heure / timestamp_iso | `created_at` | un seul timestamp |
| auteur (texte « Allan ») | `author_id` | FK `users` au lieu d'un nom libre |
| projet (texte) | `project_id` | FK `projects` |
| type_entree | `type` | idée/décision/action/problème |
| source | `source` | `audio` \| `note` |
| sujet | `subject` | à garder |
| note_manuelle | `manual_note` | |
| transcription_brute | `raw_transcript` | |
| resume_ia | `ai_summary` | |
| discussion_du_jour / points_evolution / decisions / points_non_clotures / concordance_idees | `payload` (jsonb) | tout le JSON d'extraction |
| actions | → table **`tasks`** | une action = une tâche (voir §4) |
| priorite | `priority` | basse/moyenne/haute |
| tags | `tags` | text[] |
| statut | `status` | |
| app_version | — | à jeter (ou metadata) |
| — | **`audio_url`** | **À AJOUTER** : URL signée storage UE |

### `Projets_Memoire` → table `projects`

Mapping 1:1 propre : `objectif_actuel→objective`, `stade_actuel→current_stage`,
`strategie_actuelle→strategy`, `decisions_cles→key_decisions`,
`blocages_connus→blockers`, `prochaines_priorites→next_priorities`,
`dernier_resume→last_summary`, `date_derniere_maj→updated_at`.
**À ajouter :** `id`, `org_id`.

### `Memoire_MAJ_Proposees` → table `memory_update_proposals`

Bon design déjà : `champ_a_modifier`, `ancienne_valeur_resume`,
`nouvelle_valeur_proposee`, `raison`, `niveau_confiance`,
`validation_humaine_recommandee`, `statut`, `validated_by`, `decision`.
**À ajouter :** `org_id`, FK `project_id`.

---

## 4. Ce qui MANQUE pour la cible (à construire)

Le prototype est un **capteur + récap**, pas encore un **coordinateur**.
Manquent les briques cœur du brief (`§6`) :

- **Auth réelle + organisations + RLS** — le prototype n'a aucune notion
  d'utilisateur (juste un nom en texte) ni d'isolation. Fondation à poser.
- **Gestionnaire de tâches** — les `actions` extraites ne deviennent jamais des
  tâches suivies. Pas de statuts à faire/en cours/fait, pas de timer (plafond 3j).
- **Validation humaine AVANT déclenchement** — elle existe pour la *mémoire*,
  mais PAS pour les *tâches* (relance/escalade). À répliquer côté tâches (`§8`).
- **Anti-collision** (`task_claims`) — inexistant. C'est le gain de temps clé.
- **Accusé de lecture du rapport** (`report_reads`) — inexistant.
- **Rapport de passation** (`shift_label`, matin/jour/nuit) — le récap actuel
  n'a pas de notion d'équipe/relais.
- **Quotas & minutes** (`minutes_quota`/`minutes_used`) + Stripe — inexistant.
- **Purge auto** (rétention audio/transcriptions) — inexistant.

---

## 5. Anti-patterns à corriger (NON négociable — brief §8) ⚠️

| Problème dans le prototype | Règle violée | Correction cible |
|---|---|---|
| `secret_token` stocké en `localStorage`, envoyé dans le payload | §8.1 « jamais de token statique comme auth » | Sessions Supabase |
| Audio envoyé en `POST FormData` direct au webhook public | §8.3 « upload par URL signée, jamais POST direct » | URL signée → storage UE |
| Aucun `org_id`, données dans un Sheet partagé | §8.2 isolation stricte | RLS sur `org_id` partout |
| Utilisateurs/projets/pricing **en dur dans les prompts** | multi-tenant | contexte injecté par org |
| Synthèse via **OpenRouter** (route où ?) | §8 hébergement UE / pas d'entraînement | étudier Azure OpenAI EU (`§4`) |
| Données dans **Google Sheets** | conformité / RLS impossible | PostgreSQL Supabase |

---

## 6. Verdict — garder / adapter / jeter

- **GARDER tel quel (adapter le format) :** les 4 prompts, le template email,
  le flux UX push-to-talk, la logique de validation par proposition, le choix
  hybride des modèles.
- **ADAPTER :** le schéma de champs (ajouter `org_id`, FK, `audio_url`) ;
  externaliser le contexte client (projets/pricing) hors des prompts.
- **JETER :** Google Sheets, les webhooks n8n publics + `secret_token`, le POST
  audio direct, Netlify comme backend. C'est la plomberie remplaçable.

---

## 7. Implication sur l'ordre de construction

Confirme l'ordre du brief (`§10`) et du `snapshot.md` :

1. **Auth + organisations + RLS** d'abord (rien ne part avant l'isolation).
2. **Capture (URL signée) + pipeline transcription/extraction** — on réimporte
   le prompt WF1 + le schéma, on remplace seulement le transport audio.
3. **Tâches + validation humaine + anti-collision** — la vraie nouveauté.
4. **Rapport quotidien + accusé de lecture** — réutiliser prompt WF2 + template.
5. **Relance/escalade** (tâches validées uniquement), puis Stripe/quotas, purge.

> Décision infra en attente : confirmer avec Allan les stacks possédées
> (Supabase ? storage UE ? Azure OpenAI EU vs OpenRouter actuel).
