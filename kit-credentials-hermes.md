---
name: kit-credentials-hermes
description: Use when wiring durable credentials into Hermes' SCHEDULED-job environment (cron/scheduler) so the morning brief works — Google (OAuth complet d'Allan, rendu durable), Telegram bot token, OpenAI/Anthropic keys. Fixes the "credential present in my interactive session but absent from the cron's environment" gap. À exécuter sur le VPS.
---

# Kit credentials — débloquer le brief matinal d'Hermes

> Le brief de 9h a calé sur 3 accès (CRM Google, Telegram, clés IA). **Cause
> unique** : les jobs planifiés tournent dans un **env / profil plus nu** que la
> session interactive d'Hermes — les credentials existent, mais **pas là**. On les
> câble **durablement**, au **même endroit** que `GEMINI_API_KEY` / `MEM0_API_KEY`
> (qui, elles, marchent déjà dans son env). Prose FR, commandes EN. Sur le VPS.

---

## Étape 0 — DIAGNOSTIQUER avant de réparer (prompt à envoyer à Hermes)

```
Hermes — débloquer tes accès pour le brief matinal. AVANT de réparer, DIAGNOSTIQUE et
rapporte des FAITS (pas des suppositions). Garde-fous : ne JAMAIS afficher la valeur d'une
clé (PRESENT/ABSENT seulement), rien sur main, aucun secret committé.

1. ENV des jobs planifiés VS ta session interactive — montre où tes credentials sont chargés :
   - Dans ta session : env | grep -iE 'GEMINI|MEM0|TELEGRAM|GOOGLE|OPENAI|ANTHROPIC' | sed 's/=.*/=SET/'
   - DEPUIS le contexte du job brief/cron : la MÊME commande. Compare → qu'est-ce qui manque côté job ?
   - Où sont définies les vars qui marchent (.bashrc ? un .env ? la config de ton orchestrateur) ?
     Le job planifié source-t-il ce même fichier ?
2. GOOGLE/CRM : as-tu un token OAuth ou un service account dans le profil atelier-klar ?
   (gcloud auth list ; existence de fichiers de credentials Google — SANS afficher leur contenu)
3. TELEGRAM : le token du bot qui te sert à parler à Allan est-il dispo dans l'env du job brief,
   ou seulement dans ta session ?

Rends un TABLEAU : credential | présent en session ? | présent dans le job planifié ? | où défini.
PUIS on décide du câblage durable. Ne répare RIEN tant que le diagnostic n'est pas rendu.
```

---

## Réf 1 — Accès Google : **garder l'OAuth complet d'Allan** (décision 2026-06-14)

> Décision Allan : Hermes **garde son accès OAuth complet** au Google d'Allan
> (Gmail envoi, Drive, devis/factures, Sheets CRM). On **ne remplace pas** par un
> service account — un SA serait scopé à un seul Sheet, donc un downgrade pour tout
> ce qu'Hermes fait déjà. Le brief n'a pas calé par manque d'accès, mais parce que
> l'OAuth n'était **pas durable côté cron**. On le rend durable.

**Pourquoi « marchait hier, mort aujourd'hui » — 2 causes, les deux compatibles OAuth :**
- **(a) Token absent de l'env du cron** : présent dans la session interactive d'Hermes,
  pas dans le job de 9h (l'env du cron est plus nu).
- **(b) Refresh token expiré** : si l'app OAuth est en statut **« Test »** dans Google
  Cloud, Google **périme le refresh token au bout de 7 jours**. Symptôme exact.

**Fix durable (on garde l'OAuth) :**
1. **Google Cloud Console → écran de consentement OAuth → publier l'app « En production »**
   (« Publish app »). Supprime l'expiration 7 jours du refresh token. (Gmail/Drive = scopes
   sensibles : avertissement « app non vérifiée » sur ton propre compte → clique pour
   continuer, c'est ton app.)
2. **Re-génère un refresh token** propre après publication (celui émis en mode Test est
   sans doute déjà mort).
3. Stocke `refresh_token` + `client_id` + `client_secret` dans le **même fichier d'env
   durable** que `GEMINI`/`MEM0`, **lu par le cron**. **Jamais** dans le repo.
4. Au démarrage, le brief recharge le token → Sheets / Gmail / Drive de nouveau dispos,
   sans reconnexion interactive.

> ⚠️ OAuth = Hermes agit **« en tant qu'Allan »** (les mails partent de toi, Drive complet).
> Ce qu'il en **fait** reste cadré par `manifeste-soul-hermes.md`, pas par la techno :
> largeur de l'accès ≠ blanc-seing. **NE PAS** publier le CRM en CSV public (donnée client → fuite).

> 📦 **Alternative archivée — service account** (si un jour tu veux isoler UN job qui ne
> touche qu'un Sheet) : Service Account → clé JSON hors-repo (`chmod 600`,
> `GOOGLE_APPLICATION_CREDENTIALS`) → partager ce seul Sheet avec son email (Éditeur).
> Scopé, n'expire pas — mais ne couvre **pas** Gmail/Drive. Non retenu pour le brief.

## Réf 2 — Telegram (envoi auto du brief)

Le token du bot existe déjà (c'est lui qui te parle). Il faut juste qu'il soit dans l'env **du job** :

1. Mets `TELEGRAM_BOT_TOKEN` (+ `TELEGRAM_CHAT_ID` d'Allan = `1374851322`) dans le **même
   fichier d'env durable** que `GEMINI`/`MEM0`.
2. Dans la routine brief, après avoir construit le texte → envoi via l'API Bot (`sendMessage`).
3. Teste : un message de test arrive bien à Allan. **Jamais committer le token.**

## Réf 3 — Clés OpenAI / Anthropic (Scribe Phase 1/2 — **pas urgent**)

Ce sont les clés de la stack IA de Scribe (Whisper + Haiku), **pas encore codée**.
Quand tu attaques ces phases : provisionne `OPENAI_API_KEY` + `ANTHROPIC_API_KEY` dans
l'env (jamais le repo). En attendant, le brief tourne sans, en signalant « Phase 1/2 en attente de clés ».

---

## Garde-fous (non négociables)

- **Jamais** afficher la valeur d'une clé (PRESENT/ABSENT), **jamais** committer un secret.
- Les credentials vivent dans l'**env / un fichier hors-repo**, jamais dans un fichier tracké.
- **Diagnostic AVANT réparation** : on câble là où le job lit déjà `GEMINI`/`MEM0`.
- **OAuth complet d'Allan conservé** (décision 2026-06-14) : durabilité via app OAuth
  **« En production »** (sinon refresh token mort à 7 jours) + token dans l'env du cron.
  OAuth = Hermes agit « en tant qu'Allan » → le cadrage vit dans `manifeste-soul-hermes.md`.
  Pas de CSV public (donnée client).
