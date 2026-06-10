# legacy/ — prototype existant à analyser

> Zone de dépôt du **prototype actuel** (non commercialisable, voir
> `docs/brief-produit.md §3`). On ne le réutilise PAS tel quel : on l'analyse
> pour en extraire l'**IP à conserver**, puis on reconstruit proprement.

## Quoi déposer ici

- [ ] Le fichier **HTML « push-to-talk »** (l'app PWA actuelle).
- [ ] Les **exports des workflows n8n** (JSON) :
  - WF1 — capture → transcription → extraction → Google Sheets
  - WF2 — e-mail HTML de récap quotidien (20h30)
  - WF3 — mise à jour semi-automatique de la mémoire projet
- [ ] Tout prompt, schéma de champs ou template de mail utilisé dans ces flux.

## Ce qu'on en extraira (IP à conserver — `brief §3`)

- Les **prompts** d'extraction et de récap.
- Le **schéma des champs** JSON (résumé, décisions, actions, responsable,
  priorité, points à clarifier, tags).
- Le **format du mail HTML** de récap.
- Le **flux UX push-to-talk** et la **logique de validation humaine**.

> On remplace seulement la plomberie (Netlify/n8n/Sheets). Le « cerveau »
> (prompts + schéma + format) est l'actif à préserver.
