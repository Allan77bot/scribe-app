# Mission Hermes — Prototype complet de Scribe (sandbox)

> Design validé le 2026-06-13. Gros projet confié à Hermes : construire **l'app
> Scribe de bout en bout** sur son sandbox, comme **prototype de validation**.
> Hermes pilote **Claude Code** (headless, méthode : `docs/methode-claude-code.md`).
> Complète `HERMES.md` (rôle + mur déterministe) — en cas de conflit, `HERMES.md` prime.

---

## 1. Décisions verrouillées (Allan, 2026-06-13)

| Axe | Décision |
|---|---|
| **Périmètre** | Tout le produit, profondeur prod : capture + pipeline IA + tâches + rapport + billing. |
| **Clés IA** | **Vraies clés** dédiées sandbox (OpenAI + Anthropic), avec **plafond de dépense**. |
| **Livrable** | **Déployé sur URL Vercel sandbox**, cliquable au téléphone (mobile-first prouvé en réel). |
| **Destination** | **Prototype de validation.** Le vrai produit reste à Alphime (front) et Claude (cœur sécu). Le proto sert de référence, pas de code fusionné tel quel dans le vrai `main`. |

## 2. État de départ (déjà fait par Hermes — ne pas refaire)

- Sandbox Supabase `doorjfxqetoawqnvguvz` (→ `scribe-sandbox`) provisionné, `.env.local` en place.
- Migrations `0001` + `0002` appliquées, **4/4 tests d'isolation**, `check:rls` **vert**.
- Recherches tranchées : **SMTP → Brevo** · **transcription → OpenAI Whisper direct** (Azure EU backup).
- Claude Code authentifié sur le VPS.

> Le socle auth/RLS (migration `0001`) **existe déjà**. Cette mission construit
> **par-dessus**, jamais en le réécrivant.

---

## 3. Stratégie — garder le vrai `main` propre, voir l'app complète vivre

**Branche d'intégration longue `prototype`** (créée depuis `main`) :

- Hermes ouvre ses PR feature **contre `prototype`**, **jamais `main`**.
- Vercel sandbox **déploie `prototype`** → l'URL est toujours l'app **complète et à jour**.
- `main` = produit réel, intact (Alphime/Claude restent maîtres).

> **Correctif de gouvernance.** Hermes a poussé des commits chore directement sur
> `main` (contre `HERMES.md` §1). À partir de cette mission : **plus aucun push
> direct** — tout passe par une branche feature → PR vers `prototype` → merge Allan.

Alternatives écartées : *preview Vercel par branche* (pas de vue intégrée, or on veut
l'app entière) · *merge dans `main`* (pollue le vrai produit).

---

## 4. Découpage en 6 phases

Chaque phase = **une grosse tâche** confiée à Claude Code headless → branche dédiée
→ PR vers `prototype` → **CI verte** → merge Allan → **deploy auto**. Nouvelle table
de données = **toujours** via `/nouvelle-table` (org_id + RLS + policy).

| # | Phase | Livrable | Nouvelles tables | Dépend de |
|---|---|---|---|---|
| 0 | **Coquille UI** | Shell mobile-first + nav (Capturer/Tâches/Rapport) + PWA installable | — | socle ✅ |
| 1 | **Capture** | Push-to-talk + note écrite, upload audio par **URL signée** (Storage EU) | `recordings` | P0 |
| 2 | **Pipeline IA** | Transcription (OpenAI Whisper) → extraction (**Haiku 4.5**) → entries **proposées** | `transcripts`, `entries` | P1 + clés IA |
| 3 | **Tâches** | Liste + **validation humaine obligatoire avant tout timer** + assignation + anti-collision | `tasks` | P2 |
| 4 | **Rapport du soir** | Synthèse (**Sonnet 4.6**) + accusés de lecture | `reports`, `read_receipts` | P3 |
| 5 | **Billing** | Stripe **test mode** + quotas minutes + rétention par plan | `subscriptions`, `usage` | P3 |

### Definition of Done par phase

- **P0** — Shell déployé et navigable sur l'URL sandbox ; `overflow-x:hidden`, rien qui dépasse ; installable en PWA.
- **P1** — Depuis le tel : enregistrer une note vocale → uploadée **par URL signée** → visible dans une liste. (Jamais d'audio en POST direct via webhook — règle d'or n°3.)
- **P2** — Une note → **transcription réelle** → **N entries extraites** au statut `proposed`, affichées pour validation. Stack IA hybride respectée (mini/Haiku, pas de haut de gamme partout — règle d'or n°5).
- **P3** — Valider une entry `proposed` → devient `task` assignée. **Tant que non validée par un humain, aucun timer/relance** (règle d'or n°4 : l'IA propose, l'humain confirme).
- **P4** — Rapport du soir généré (**synthèse réelle Sonnet**) + bouton « Marquer comme lu » → receipt enregistré.
- **P5** — En **test mode** Stripe : souscrire un plan, voir le quota minutes décompter, rétention appliquée selon le plan.

### DoD global de la mission

Depuis ton téléphone, sur l'URL sandbox, tu parcours **capturer → entries validées en
tâches → rapport du soir**, en mobile-first, **isolation org respectée** (`check:rls`
vert sur toutes les tables, test d'isolation toujours 4/4).

---

## 5. Prérequis à fournir (Allan) avant le go

1. **Clé OpenAI** (test, **plafond de dépense**) — transcription Whisper.
2. **Clé Anthropic** (test, **plafond de dépense**) — extraction Haiku + synthèse Sonnet.
3. **Cible Vercel sandbox** : projet Vercel lié à la branche `prototype` **ou** un token
   Vercel pour qu'Hermes déploie en CLI. Variables d'env (Supabase sandbox + clés IA,
   **côté serveur**) configurées **dans Vercel**, jamais commitées.
4. **Confirmation e-mail** : la laisser **OFF** (auto-confirm) sur le sandbox pour fluidifier
   le proto. Le branchement **Brevo** (déjà tranché) est un chantier séparé, plus tard.

> Sandbox Supabase + isolation : **déjà faits**. Il ne reste que les clés IA + la cible Vercel.

---

## 6. Garde-fous delta (en plus de `HERMES.md`)

1. **Nouvelle table = `/nouvelle-table` uniquement** (org_id + RLS + policy). `check:rls`
   **vert** avant chaque PR. **Jamais** toucher au cœur auth / migration `0001`/`0002`.
   Si un besoin l'exigeait → PR dédiée préfixée `security:`, revue Claude + Allan.
2. **Secrets** (clés IA, token Vercel, mot de passe DB) : env sandbox / env Vercel **only**.
   Jamais dans le code, une PR, ou le Journal. **Plafond de dépense** sur les clés IA.
3. **Déploiement** = Vercel sandbox depuis `prototype` **only**. Le vrai projet Supabase EU
   (`scribe`, `kgbxxzujlubflsvprmef`) reste **interdit**, comme ses clés.
4. **PR contre `prototype`, merge par Allan, jamais `main`, jamais auto-merge.**
5. Aucun canal sortant réel (pas d'e-mail/webhook de prod émis depuis le sandbox).

---

## 7. Pilotage de Claude Code par Hermes

Pour chaque phase, depuis le clone du repo :

```bash
claude -p "Lis HERMES.md, docs/methode-claude-code.md et ce spec. \
Phase <n> : <objectif>. Travaille en mode plan d'abord (propose, je valide), \
branche dédiée, PR vers prototype — jamais main. Nouvelle table via /nouvelle-table, \
check:rls vert avant la PR." --permission-mode bypassPermissions
```

Discipline imposée (méthode Allan) : **plan → exécution → auto-vérif → challenge**,
subagents pour la recherche/exploration (contexte principal propre), contexte minimal,
mobile-first vérifié sur capture d'écran avant de clore une phase.

---

## 8. Mise en route — cartes Board + message Telegram

### Cartes Board (onglet `Taches`, Projet = `Scribe`, Responsable = `Hermes`)

| # | Titre | Prio |
|---|---|---|
| 6 | Créer la branche `prototype` (depuis `main`) + brancher le deploy Vercel sandbox dessus | haute |
| 7 | **Phase 0** — Coquille UI mobile-first (shell + nav + PWA) → PR vers `prototype` | haute |
| 8 | **Phase 1** — Capture (push-to-talk + note écrite, upload audio URL signée) · table `recordings` | haute |
| 9 | **Phase 2** — Pipeline IA (Whisper → Haiku → entries proposées) · tables `transcripts` + `entries` | haute |
| 10 | **Phase 3** — Tâches (validation humaine avant timer + assignation) · table `tasks` | haute |
| 11 | **Phase 4** — Rapport du soir (synthèse Sonnet + accusés de lecture) · tables `reports` + `read_receipts` | moyenne |
| 12 | **Phase 5** — Billing (Stripe test mode + quotas + rétention) · tables `subscriptions` + `usage` | moyenne |

Chaque carte : branche dédiée → PR vers `prototype` → CI verte → merge Allan → deploy auto.
Toute action significative = ligne dans l'onglet `Journal`.

### Message Telegram (coller, remplacer les `<…>`)

```
Hermes, grosse mission SCRIBE : construire l'app COMPLETE sur ton sandbox,
comme prototype de validation déployé sur une URL Vercel (cliquable au tel).

Réf : docs/superpowers/specs/2026-06-13-prototype-app-complete-hermes-design.md
(à lire en entier) + docs/methode-claude-code.md (méthode pour piloter Claude Code).

Clé OpenAI (test) : <CLE_OPENAI>
Clé Anthropic (test) : <CLE_ANTHROPIC>
Cible Vercel sandbox : <PROJET_OU_TOKEN_VERCEL>

Règles non négociables :
- branche `prototype` créée depuis main ; tes PR vont CONTRE `prototype`, JAMAIS main
  (fini les push directs sur main) ;
- 6 phases dans l'ordre (P0 coquille → P1 capture → P2 pipeline → P3 tâches →
  P4 rapport → P5 billing), une phase = une branche = une PR ;
- nouvelle table TOUJOURS via /nouvelle-table, check:rls vert avant chaque PR ;
- secrets (clés IA, token Vercel) jamais commités ; plafond de dépense sur les clés ;
- pour chaque phase tu pilotes Claude Code en mode plan d'abord (il propose, on valide).

Commence par la carte 6 (branche prototype + deploy Vercel), puis attaque la Phase 0.
Accuse réception avec un résumé en 3 lignes de ta compréhension de la mission.
```

### Ligne onglet `Projets`

`Scribe` · statut `en cours` · resp `Allan` · next `Hermes : prototype app complète (6 phases)` ·
desc `App complète sur sandbox déployée Vercel, prototype de validation (repo scribe-app, branche prototype)`.
