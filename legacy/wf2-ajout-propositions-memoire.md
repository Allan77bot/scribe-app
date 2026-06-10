# WF2 — Ajouter les propositions mémoire dans Google Sheets

À placer dans le Workflow 2, juste après `Code — Parser récap IA`.

## Onglet à créer : `Memoire_MAJ_Proposees`

Colonnes :

```text
id
date
projet
champ_a_modifier
ancienne_valeur_resume
nouvelle_valeur_proposee
raison
niveau_confiance
validation_humaine_recommandee
statut
validated_by
decision
source_recap_date
applique_le
```

## Node : Code — Préparer MAJ mémoire proposées

```js
const recap = $json;

const proposals = Array.isArray(recap.maj_memoire_proposees)
  ? recap.maj_memoire_proposees
  : [];

if (!proposals.length) {
  return [];
}

return proposals.map((item, index) => {
  return {
    json: {
      id: `mem_${Date.now()}_${index}`,
      date: recap.date || '',
      projet: item.projet || '',
      champ_a_modifier: item.champ_a_modifier || '',
      ancienne_valeur_resume: item.ancienne_valeur_resume || '',
      nouvelle_valeur_proposee: item.nouvelle_valeur_proposee || '',
      raison: item.raison || '',
      niveau_confiance: item.niveau_confiance || '',
      validation_humaine_recommandee: item.validation_humaine_recommandee === false ? 'non' : 'oui',
      statut: 'À valider',
      validated_by: '',
      decision: '',
      source_recap_date: recap.date || '',
      applique_le: ''
    }
  };
});
```

## Node : Google Sheets — Append Row

Sheet : `Memoire_MAJ_Proposees`

Mapping :

```text
id → {{$json.id}}
date → {{$json.date}}
projet → {{$json.projet}}
champ_a_modifier → {{$json.champ_a_modifier}}
ancienne_valeur_resume → {{$json.ancienne_valeur_resume}}
nouvelle_valeur_proposee → {{$json.nouvelle_valeur_proposee}}
raison → {{$json.raison}}
niveau_confiance → {{$json.niveau_confiance}}
validation_humaine_recommandee → {{$json.validation_humaine_recommandee}}
statut → {{$json.statut}}
validated_by → {{$json.validated_by}}
decision → {{$json.decision}}
source_recap_date → {{$json.source_recap_date}}
applique_le → {{$json.applique_le}}
```

Ensuite, continue vers ton Code HTML + Gmail.
