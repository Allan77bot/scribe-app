Ajoute ceci au System Prompt du WF2 :

Pour maj_memoire_proposees :
- Ne propose une mise à jour mémoire que si l’entrée du jour apporte une information nouvelle, claire et exploitable.
- Ne propose pas de mise à jour mémoire pour une transcription incomplète, une phrase floue ou une simple discussion sans décision.
- Les champs autorisés sont uniquement : objectif_actuel, stade_actuel, strategie_actuelle, decisions_cles, blocages_connus, prochaines_priorites, dernier_resume.
- Si la mise à jour concerne objectif_actuel, strategie_actuelle ou decisions_cles, validation_humaine_recommandee doit toujours être true.
- Chaque proposition doit pouvoir être validée ou refusée par Allan/Alphim depuis l’app.
- La nouvelle_valeur_proposee doit être directement exploitable pour enrichir le champ Projets_Memoire.
