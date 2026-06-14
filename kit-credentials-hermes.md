---
name: kit-credentials-hermes
description: Use when wiring durable credentials into Hermes' SCHEDULED-job environment (cron/scheduler) so the morning brief works — Google Sheets/CRM via service account, Telegram bot token, OpenAI/Anthropic keys. Fixes the "credential present in my interactive session but absent from the cron's environment" gap. À exécuter sur le VPS.
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

## Réf 1 — CRM Google Sheet : **service account** (la voie durable)

> Un compte de service Google = accès **non interactif** qui **n'expire pas**
> (≠ OAuth utilisateur, fait pour un humain). C'est LA bonne voie pour un cron —
> c'est d'ailleurs ce qu'Hermes a proposé lui-même.

1. **Google Cloud Console** → un projet → active **« Google Sheets API »**.
2. Crée un **Service Account** → génère une **clé JSON** → télécharge-la.
3. **Partage le Sheet CRM** (ID `1_ggSDvYDJZgDMQUh0opePXItm9WwaC049zMAuHKHfVE`) avec
   l'email du service account (`xxx@xxx.iam.gserviceaccount.com`), rôle **Lecteur**.
4. Sur le VPS : pose le JSON **hors du repo** (ex. `/home/hermes/.secrets/sheets-sa.json`,
   `chmod 600`) et expose `GOOGLE_APPLICATION_CREDENTIALS=/chemin/sheets-sa.json` dans
   l'env **du job** (même fichier que `GEMINI`/`MEM0`). **Jamais** dans le repo.
5. Code : `gspread` + `google-auth` (service_account) pour lire le Pipeline. Teste la lecture.

> ⚠️ **NE PAS** publier le CRM en CSV public : c'est de la **donnée client** → fuite.
> Le service account est la seule voie propre.

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
- Service account **Lecteur** sur le CRM — pas Éditeur, pas de CSV public.
