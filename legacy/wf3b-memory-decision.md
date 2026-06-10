# WF3-B — Webhook POST `memory-decision`

Objectif : quand Allan ou Alphim clique sur Valider / Refuser dans l'app, ce workflow applique la décision.

## Payload reçu par l'app

```json
{
  "proposal_id": "mem_1780000000_0",
  "decision": "approved",
  "validated_by": "Allan",
  "secret_token": "TON_TOKEN"
}
```

ou :

```json
{
  "proposal_id": "mem_1780000000_0",
  "decision": "rejected",
  "validated_by": "Alphim",
  "secret_token": "TON_TOKEN"
}
```

## Structure

```text
Webhook POST memory-decision
→ Code : normaliser décision
→ IF token valide
→ Google Sheets : lire proposition par id
→ IF decision rejected
   → Update proposition Refusé
   → Respond
→ IF decision approved
   → Google Sheets : lire Projets_Memoire par projet
   → Code : préparer update projet
   → Google Sheets : update Projets_Memoire
   → Google Sheets : update Memoire_MAJ_Proposees Appliqué
   → Respond
```

## Node 1 — Webhook

```text
Method : POST
Path : memory-decision
Response Mode : Using Respond to Webhook node
Allowed Origins/CORS : ton URL Netlify, ou * pour le test
```

URL production :

```text
https://n8n.srv852345.hstgr.cloud/webhook/memory-decision
```

## Node 2 — Code : Normaliser décision

```js
const body = $json.body || $json;
const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

return [
  {
    json: {
      proposal_id: body.proposal_id || '',
      decision: body.decision || '',
      validated_by: body.validated_by || '',
      secret_token: body.secret_token || '',
      app_version: body.app_version || '',
      timestamp_iso: body.timestamp_iso || new Date().toISOString(),
      now
    }
  }
];
```

## Node 3 — IF token valide

Condition :

```js
{{ $json.secret_token }} equals TON_TOKEN_SECRET
```

Si faux : Respond Webhook :

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Node 4 — Google Sheets : lire proposition

Sheet : `Memoire_MAJ_Proposees`

```text
Operation : Get Row(s)
Return All : false ou true
Filter : id = {{ $('Code : Normaliser décision').first().json.proposal_id }}
```

## Node 5 — Code : Vérifier proposition

```js
const decision = $('Code : Normaliser décision').first().json;
const proposition = $input.first()?.json || {};

if (!proposition.id) {
  return [{ json: { error: true, message: 'Proposition introuvable', decision } }];
}

const statut = String(proposition.statut || '').trim().toLowerCase();
if (statut !== 'à valider') {
  return [{ json: { error: true, message: `Proposition déjà traitée : ${proposition.statut}`, decision, proposition } }];
}

return [{ json: { ...decision, proposition } }];
```

## Node 6 — IF erreur

Si `{{$json.error}}` est true → Respond Webhook :

```json
{
  "success": false,
  "error": "{{$json.message}}"
}
```

## Node 7 — IF decision rejected

Condition :

```js
{{ $json.decision }} equals rejected
```

### Si true — Google Sheets Update Row `Memoire_MAJ_Proposees`

Identifiant :

```text
Column : id
Value : {{$json.proposal_id}}
```

Mets à jour :

```text
statut → Refusé
validated_by → {{$json.validated_by}}
decision → rejected
applique_le → {{$json.now}}
```

Puis Respond :

```json
{
  "success": true,
  "status": "rejected",
  "message": "Suggestion refusée."
}
```

## Branche approved

## Node 8 — Google Sheets : lire `Projets_Memoire`

Sheet : `Projets_Memoire`

Filtre :

```text
projet = {{$json.proposition.projet}}
```

## Node 9 — Code : Préparer update projet mémoire

```js
const decisionData = $('Code : Vérifier proposition').first().json;
const proposition = decisionData.proposition;
const projetRow = $input.first()?.json || {};
const now = decisionData.now || new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

const champ = proposition.champ_a_modifier;
const nouvelleValeur = String(proposition.nouvelle_valeur_proposee || '').trim();

const champsAutorises = [
  'objectif_actuel',
  'stade_actuel',
  'strategie_actuelle',
  'decisions_cles',
  'blocages_connus',
  'prochaines_priorites',
  'dernier_resume'
];

if (!projetRow.projet) {
  return [{ json: { error: true, message: `Projet introuvable : ${proposition.projet}` } }];
}

if (!champsAutorises.includes(champ)) {
  return [{ json: { error: true, message: `Champ non autorisé : ${champ}` } }];
}

const updatedRow = {
  ...projetRow,
  projet: projetRow.projet || proposition.projet,
  date_derniere_maj: now,
  _memoire_update_id: proposition.id,
  _validated_by: decisionData.validated_by,
  _now: now
};

const ancienneValeur = String(projetRow[champ] || '').trim();

if (!ancienneValeur) {
  updatedRow[champ] = nouvelleValeur;
} else {
  updatedRow[champ] = `${ancienneValeur}\n\n[Mise à jour ${now} validée par ${decisionData.validated_by}]\n${nouvelleValeur}`;
}

return [{ json: updatedRow }];
```

## Node 10 — IF erreur update projet

Si `{{$json.error}}` est true → Respond Webhook error.

## Node 11 — Google Sheets Update Row `Projets_Memoire`

Identifiant :

```text
Column : projet
Value : {{$json.projet}}
```

Mapping :

```text
projet → {{$json.projet}}
objectif_actuel → {{$json.objectif_actuel}}
stade_actuel → {{$json.stade_actuel}}
strategie_actuelle → {{$json.strategie_actuelle}}
decisions_cles → {{$json.decisions_cles}}
blocages_connus → {{$json.blocages_connus}}
prochaines_priorites → {{$json.prochaines_priorites}}
dernier_resume → {{$json.dernier_resume}}
date_derniere_maj → {{$json.date_derniere_maj}}
```

## Node 12 — Google Sheets Update Row `Memoire_MAJ_Proposees`

Identifiant :

```text
Column : id
Value : {{$json._memoire_update_id}}
```

Mets à jour :

```text
statut → Appliqué
validated_by → {{$json._validated_by}}
decision → approved
applique_le → {{$json._now}}
```

## Node 13 — Respond Webhook

```json
{
  "success": true,
  "status": "approved",
  "message": "Suggestion appliquée à la mémoire projet."
}
```
