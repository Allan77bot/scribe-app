# Historique — journal du projet

> Journal **daté et append-only** : on ajoute en haut, on ne réécrit jamais le
> passé. C'est la mémoire et l'audit du projet. Pour l'état présent →
> voir `snapshot.md`.

Format d'une entrée :
```
## AAAA-MM-JJ — Titre court
- **Décisions :** …
- **Fait :** …
- **Ouvert :** …
```

---

## 2026-06-10 — Répartition des rôles clarifiée (back / front)

- **Décisions :**
  - **Allan = back-end** : base de données, RLS, fonctionnalités, pipeline IA, dev
    appli (délègue le code à Claude Code). **Alphime = front** : design, UX/UI,
    intégration des fonctionnalités, facilité de navigation.
    (Inverse la répartition provisoire notée le 2026-06-09.)
  - **Workflow en 2 temps** validé : Allan pose le socle back-end → Alph relit/juge →
    Allan adapte → Alph enchaîne sur le front. **Optimisation** : figer le modèle de
    données + le contrat d'API tôt et ensemble, pour que le front démarre **en
    parallèle** contre le contrat plutôt qu'en attente (cascade pure).

## 2026-06-10 — Route IA confirmée + analyse concurrentielle + modèle de coût

- **Décisions :**
  - **Route IA = API Anthropic directe, confirmée comme non bloquante.** Le DPA est
    inclus automatiquement à l'acceptation des conditions commerciales ; no-training
    par défaut sur l'API ; rétention 30j par défaut ; transfert UE couvert par les SCC.
    **Zéro investissement de départ** (paiement à l'usage). ZDR = option à demander
    plus tard si exigé par un client, pas au MVP.
  - **Stack modèle confirmée** : transcription OpenAI mini, extraction **Claude Haiku
    4.5** (le moins cher, ~1 $/5 $ par M tokens), synthèse **Claude Sonnet 4.6** (1×/jour).
  - **OpenRouter + DeepSeek écartés explicitement** : route les données hors UE,
    fournisseur chinois sans adéquation RGPD, conditions d'entraînement floues.
    Mentionner l'IA dans les mentions légales ne suffit PAS à rendre un modèle non
    conforme légal — chaque sous-traitant doit avoir DPA + no-training + transfert encadré.
  - **Rétention = variable selon le plan** (durée courte incluse, plus longue en payant).
  - **Résidence Supabase EU assumée comme différenciateur** : l'analyse concurrentielle
    (Plaud, Fathom, Otter, Fireflies) montre qu'ils stockent tous aux **US** et se
    couvrent par Data Privacy Framework / SCC — personne ne fait de vraie résidence UE.
    Fathom utilise d'ailleurs Anthropic/OpenAI/Google en sous-traitants no-training :
    notre route IA = standard du marché.
- **Ouvert :**
  - Intégrations CRM/Airtable/Sheets/Notion : phase 2 (export) vs MVP — à décider à trois.
  - Transcription : OpenAI direct vs Azure OpenAI EU — avant `feat/pipeline`.

## 2026-06-10 — Blocages tranchés : route IA, hébergement, Hermes

- **Décisions (confirmées avec Allan) :**
  - **Route IA conforme = API Anthropic directe + DPA + résidence EU /
    zéro-rétention** (compte déjà possédé). Remplace le choix Bedrock du 2026-06-09.
    AWS Bedrock EU reste une **cible future** si un client exige strictement AWS.
  - **Hébergement front = Vercel** (natif Next.js). Netlify écarté.
  - **Hermes = outil d'orga interne de l'équipe** (coordination), **sans rapport
    avec le produit Scribe** → pas de doublon avec le futur gestionnaire de tâches.
    On l'ignore côté produit.
- **Conséquence :** plus aucun blocage ouvert pour démarrer le socle `feat/auth`
  (auth + organisations + RLS, Supabase, projet à créer de zéro).
- **Ouvert :**
  - Créer le projet Supabase (région EU) + récupérer URL/clés avant d'appliquer
    les migrations.
  - Signer le DPA Anthropic + activer résidence EU/zéro-rétention avant `feat/pipeline`.

## 2026-06-09 — Stack technique tranchée + organisation à 2

- **Décisions (confirmées avec Allan) :**
  - Stack : Next.js + Vercel/Netlify, Supabase (Postgres/Auth/RLS + Storage EU,
    URL signées), transcription OpenAI mini, extraction Claude Haiku 4.5,
    synthèse Claude Sonnet 4.6. Détail → `docs/stack-technique.md`.
  - **Route IA conforme = Claude via AWS Bedrock EU** (remplace OpenRouter).
  - n8n gardé au début, puis logique rapatriée dans le code (Edge Functions).
  - Comptes déjà possédés : Supabase, Vercel/Netlify, IA (OpenAI/Anthropic/Azure).
  - **Équipe : 2 devs qui codent tous les deux** → répartition par domaine
    (Allan front/design, binôme auth/backend/pipeline), PRs croisées.
- **Ouvert :**
  - Compte AWS pour Bedrock (sinon API Anthropic directe + DPA EU).
  - Vercel vs Netlify.
  - Rôle de « Hermes » / du dashboard d'orga (risque doublon avec le
    gestionnaire de tâches de Scribe) — à clarifier avec Allan.

## 2026-06-09 — Analyse du prototype legacy

- **Fait :**
  - Prototype complet déposé dans `legacy/` (app HTML PWA, 3 workflows n8n,
    prompts, template email, schéma Sheets, seeds).
  - Analyse détaillée écrite dans `docs/analyse-legacy.md`.
- **Décisions / constats :**
  - **IP confirmée et conservée** : prompts WF1 (extraction), WF2 (récap avec
    comparaison à la mémoire), WF3 (MAJ mémoire contrôlée), template email,
    flux UX push-to-talk, logique de validation par proposition.
  - La **stack IA hybride du brief est déjà respectée** par le prototype :
    gpt-5-mini pour extraire, claude-sonnet-4.5 pour la synthèse du soir.
  - **Anti-patterns à corriger** (brief §8) : `secret_token` en localStorage,
    POST audio direct au webhook, aucun `org_id`, données en Google Sheets,
    contexte client en dur dans les prompts, routage via OpenRouter.
  - **Manquent (à construire)** : auth/org/RLS, gestionnaire de tâches, timers,
    anti-collision, accusé de lecture, rapport de passation, quotas/Stripe, purge.
- **Ouvert :**
  - Trancher infra avec Allan : Supabase, storage UE, Azure OpenAI EU vs OpenRouter.
  - Prochaine branche de dev : `feat/auth` (socle isolation).

## 2026-06-09 — Mise en place de l'architecture documentaire

- **Décisions :**
  - Adoption d'une architecture doc en **index slim** : `CLAUDE.md` ne contient
    que la mission, les règles d'or et des pointeurs ; le détail reste dans
    `docs/brief-produit.md` (spec canonique, anciennement
    `scribe-ia-brief-claude-code.md`).
  - Séparation nette des rôles : **snapshot = présent mutable**,
    **historique = passé immuable**, **brief = spec stable**.
  - **Workflow Git** : une préoccupation = une branche = une PR. Claude crée une
    nouvelle branche à chaque init si le concern change (design, login, etc.).
  - **Cible** : projet conçu **B-ready** (équipes en relais) ; validation
    initiale via testeurs profil A ; couche différenciante B en priorité 2.
    (Décision révisable, suivie dans `snapshot.md`.)
- **Fait :**
  - Création de `CLAUDE.md`, `snapshot.md`, `historique.md`.
  - Déplacement du brief dans `docs/brief-produit.md`.
- **Ouvert :**
  - Récupérer le prototype existant (HTML push-to-talk + workflows n8n) dans
    `legacy/` pour analyse → prochaine étape.
  - Confirmer les stacks déjà possédées par l'équipe avant de coder l'infra.
