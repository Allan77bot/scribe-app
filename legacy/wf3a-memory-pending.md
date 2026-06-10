# WF3-A — Webhook GET `memory-pending`

Objectif : permettre à l'app mobile d'afficher les suggestions mémoire en attente.

## Structure

```text
Webhook GET memory-pending
→ Google Sheets : lire Memoire_MAJ_Proposees
→ Code : filtrer et répondre
→ Respond to Webhook
```

## Node 1 — Webhook

```text
Method : GET
Path : memory-pending
Response Mode : Using Respond to Webhook node
Allowed Origins/CORS : ton URL Netlify, ou * pour le test
```

URL production :

```text
https://n8n.srv852345.hstgr.cloud/webhook/memory-pending
```

## Node 2 — Google Sheets : lire `Memoire_MAJ_Proposees`

```text
Operation : Get Row(s)
Return All : true
Sheet : Memoire_MAJ_Proposees
```

Tu peux mettre un filtre `statut = À valider`, ou laisser le Code Node filtrer.

## Node 3 — Code : Filtrer propositions en attente

```js
const rows = $input.all().map(item => item.json);

const pending = rows
  .filter(row => String(row.statut || '').trim().toLowerCase() === 'à valider')
  .filter(row => row.id && row.projet && row.champ_a_modifier)
  .map(row => ({
    id: row.id,
    date: row.date || '',
    projet: row.projet || '',
    champ_a_modifier: row.champ_a_modifier || '',
    ancienne_valeur_resume: row.ancienne_valeur_resume || '',
    nouvelle_valeur_proposee: row.nouvelle_valeur_proposee || '',
    raison: row.raison || '',
    niveau_confiance: row.niveau_confiance || '',
    validation_humaine_recommandee: row.validation_humaine_recommandee || '',
    statut: row.statut || ''
  }));

return [
  {
    json: {
      success: true,
      count: pending.length,
      items: pending
    }
  }
];
```

## Node 4 — Respond to Webhook

Response Body :

```js
{{$json}}
```
