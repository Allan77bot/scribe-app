# Scribe IA V1.6 — Capture + Mémoire

## Nouveautés

- Onglet `🎙️ Capture` : vocaux et notes comme en V1.5.
- Onglet `🧠 Mémoire` : affiche les suggestions de mise à jour mémoire et permet de les valider/refuser depuis le téléphone.
- Aucun menu déroulant pour utilisateur, projet, type ou mode.
- Favicon intégré.

## Webhooks n8n préconfigurés

Capture :

```text
https://n8n.srv852345.hstgr.cloud/webhook/transcribeagent
```

Lire les suggestions mémoire :

```text
https://n8n.srv852345.hstgr.cloud/webhook/memory-pending
```

Valider/refuser une suggestion :

```text
https://n8n.srv852345.hstgr.cloud/webhook/memory-decision
```

## Onglets Google Sheets nécessaires

- `Scribe_Entrees`
- `Projets_Memoire`
- `Memoire_MAJ_Proposees`

Les instructions n8n sont dans le dossier `/n8n`.

## Déploiement Netlify

Déploie tout le dossier sur Netlify. Si l’ancienne app reste affichée, vide le cache du navigateur ou ouvre en navigation privée.
