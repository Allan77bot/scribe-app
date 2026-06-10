# Workflow 3 recommandé — Mise à jour de `Projets_Memoire`

## Recommandation
Ne laisse pas l'agent de récap quotidien modifier directement `Projets_Memoire` dans le même prompt.

Le plus propre est un 3e workflow séparé ou une deuxième partie du WF2 après génération du mail :

1. Lire `Scribe_Entrees` du jour.
2. Lire `Projets_Memoire`.
3. Lire le JSON du récap quotidien si tu le stockes.
4. Envoyer tout ça à l'agent `Responsable Mémoire Projet`.
5. L'agent sort un JSON de patch.
6. Code node valide le patch.
7. Deux options :
   - V1 semi-auto : append les propositions dans un onglet `Memoire_MAJ_Proposees` avec statut `À valider`.
   - V2 auto contrôlée : si `appliquer_auto = true` et `niveau_confiance = fort`, update la ligne du projet dans `Projets_Memoire`.

## Pourquoi ne pas tout mettre dans l'agent récap ?
- Le récap sert à communiquer.
- La mémoire sert à piloter la stratégie dans le temps.
- Mélanger les deux augmente le risque que l'IA modifie la mémoire pour une simple idée passagère.

## Onglet recommandé : `Memoire_MAJ_Proposees`
Colonnes :
- id
- date
- projet
- champ
- ancienne_valeur_resume
- nouvelle_valeur
- raison
- niveau_confiance
- appliquer_auto
- statut
- date_traitement

## Règle pratique
Pendant les premiers jours, garde le mode semi-auto.
Quand les propositions sont bonnes pendant 7 à 10 jours, on active l'auto-update uniquement pour les champs :
- blocages_connus
- prochaines_priorites
- dernier_resume
- date_derniere_maj

Pour `objectif_actuel`, `strategie_actuelle` et `decisions_cles`, mieux vaut validation humaine.
