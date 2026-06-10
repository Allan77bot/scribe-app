# Scribe IA — Brief projet pour Claude Code

> Document de référence à lire en entier avant toute tâche de développement.
> Il décrit ce qu'est le produit, ce qui existe, ce qu'il faut construire, et surtout les règles à ne jamais enfreindre.

---

## 1. Mission en une phrase

Scribe IA transforme des **notes vocales et écrites** en **coordination d'équipe** : suivi des tâches, accusés de lecture, et un **rapport de passation** automatique pour que des personnes (ou des équipes successives) sachent où en est le travail sans se marcher dessus.

**Ce n'est PAS** « un outil de transcription » (commodité) ni « une mémoire » qui ne fait que stocker. Le centre de gravité est la **coordination active**.

---

## 2. Décision encore ouverte (impacte le modèle de données)

Deux cibles possibles, tranchées par le profil des premiers testeurs :

- **Route A — Dirigeants / associés / petites structures.** 1 à quelques utilisateurs, chacun ses projets.
- **Route B — Équipes en relais (3×8, décalage horaire).** Plusieurs utilisateurs, rôles, passation entre équipes. Piste la plus différenciante.

**Conséquence pour le dev :** concevoir le modèle de données **multi-utilisateur dès le départ** (organisation → membres → rôles), pour que la Route B ne nécessite pas de refonte. La Route A est simplement le cas « organisation à 1-2 membres ».

---

## 3. Ce qui existe aujourd'hui (à NE PAS reproduire en l'état)

Prototype interne fonctionnel, mais non commercialisable :

- App PWA « push-to-talk » (Netlify) → webhook **n8n**.
- Transcription **OpenAI** (`gpt-4o-transcribe`).
- Agent IA d'extraction → JSON (résumé, décisions, actions, responsable, priorité, points à clarifier, tags).
- Stockage **Google Sheets** (3 onglets : `Scribe_Entrees`, `Projets_Memoire`, `Memoire_MAJ_Proposees`).
- WF2 : e-mail HTML de récap quotidien à 20h30.
- WF3 : mise à jour semi-automatique de la mémoire projet avec validation humaine.

**IP à conserver et réutiliser :** les prompts d'extraction et de récap, le schéma des champs, le format du mail HTML, le flux UX push-to-talk, la logique de validation humaine. C'est le cerveau du produit. On remplace seulement la plomberie.

---

## 4. Architecture cible

| Couche | Choix | Note |
|---|---|---|
| Front | Next.js, PWA installable, **mobile-first strict** (`overflow-x:hidden`, rien qui dépasse) | l'actuel n'est pas mobile-first |
| Auth + base | **Supabase** (PostgreSQL + Auth) | multi-tenant via **row-level security** |
| Stockage audio | S3 / Cloudflare R2 **région UE**, **upload par URL signée** | règle la limite Netlify ~4,5 Mo |
| Transcription | `gpt-4o-mini-transcribe` (~0,003 $/min) ou Whisper | moitié prix du modèle haut de gamme |
| Extraction JSON | petit modèle (mini / nano) | coût tokens négligeable |
| Synthèse du soir | modèle moyen, 1×/jour | seul appel « premium » |
| Conformité IA | étudier **Azure OpenAI EU** | DPA Microsoft intégré, hébergement UE, pas d'entraînement sur les données |
| Orchestration | n8n conservé au début, **credentials par compte** | pas de clé unique partagée |
| Facturation | Stripe (forfaits + quotas) | préfacturation possible pour contrôler coûts IA |

> Les stacks déjà possédées par l'équipe sont prioritaires sur ces propositions — à arbitrer avec Allan avant de coder l'infra.

---

## 5. Modèle de données (cible, simplifié)

Concevoir avec isolation stricte par organisation (RLS sur `org_id` partout).

- **organizations** : `id`, `name`, `plan`, `minutes_quota`, `minutes_used_this_period`, `created_at`
- **users** : `id`, `org_id`, `email`, `display_name`, `role` (`admin` | `member`)
- **projects** : `id`, `org_id`, `name`, `objective`, `current_stage`, `strategy`, `key_decisions`, `blockers`, `next_priorities`, `last_summary`, `updated_at`
- **entries** : `id`, `org_id`, `author_id`, `project_id`, `type` (idée/décision/action/problème), `source` (`audio`|`note`), `audio_url`, `raw_transcript`, `ai_summary`, `decisions`, `priority`, `tags`, `created_at`
- **tasks** : `id`, `org_id`, `project_id`, `entry_id`, `title`, `assignee_id`, `status` (`a_faire`|`en_cours`|`fait`), `priority`, `due_at`, `timer_max_days` (défaut 3), `validated_by_human` (bool), `created_at`, `done_at`
- **task_claims** (anti-collision) : `task_id`, `user_id`, `claimed_at` — qui est « déjà sur » la tâche
- **reports** : `id`, `org_id`, `report_date`, `shift_label` (matin/jour/nuit, pour Route B), `html`, `audio_url` (brief audio optionnel), `created_at`
- **report_reads** (accusé de lecture) : `report_id`, `user_id`, `read_at`
- **memory_update_proposals** : propositions de MAJ mémoire à valider (repris de l'existant)

---

## 6. Fonctionnalités à construire

Inclut les ajouts demandés par le fondateur. Verdict entre crochets.

1. **Capture push-to-talk + note écrite** [base] — tag auteur/projet/type, upload audio par URL signée vers storage EU, jamais en POST direct.
2. **Pipeline transcription → extraction** [base] — stack hybride (section 4). Sortie = JSON structuré rangé dans `entries`.
3. **Gestionnaire de tâches** [garder, cœur] — statuts à faire / en cours / fait. Timer par tâche **plafonné à 3 jours** ; si aucun timer défini → 3 jours par défaut.
4. **Anti-collision** [garder, cœur] — afficher qui est déjà sur une tâche (`task_claims`) pour ne pas la doubler. C'est le gain de temps clé.
5. **Relance + escalade** [garder, à cadrer] — pas de réaction avant échéance → notif à l'assignee → puis au responsable. **Voir règle de sécurité §8.**
6. **Accusé de lecture du rapport** [garder] — case « j'ai lu » → `report_reads`. Tableau « qui a lu / quand » pour l'admin (utile Route B).
7. **Rapport de passation** [garder] — généré en fin de période/jour : fait / reste à faire / à reprendre par l'équipe suivante. Envoi e-mail + notif. Consultable dans l'app.
8. **Brief audio du rapport** [phase 2] — TTS du rapport pour écoute en déplacement. Coût à la lecture → ne pas activer par défaut.
9. **Réservation de ressources (salles)** [idée future] — même logique que l'anti-collision (« déjà pris, confirmer ? »). Ne pas construire maintenant.

---

## 7. Stack IA & règles de coût

- **Toujours** la stack hybride : mini-transcribe pour transcrire, petit modèle pour extraire, modèle moyen **seulement** pour la synthèse du soir. Ne jamais mettre le modèle haut de gamme partout (×2 à ×3 le coût).
- **Attribuer la consommation par organisation** (compter les minutes d'audio dans `minutes_used_this_period`).
- **Plafonner par plan** (`minutes_quota`). Au-delà → bloquer ou facturer l'overage, jamais saigner silencieusement.
- Règle d'or de tarification : **prix payé ≥ 3× le coût IA du quota inclus.**
- Tarif transcription vérifié 2026 : **~0,003 $/min** (mini) / ~0,006 $/min (haut de gamme). Les coûts tokens d'extraction/synthèse sont petits devant la transcription.

---

## 8. Règles de sécurité & RGPD (NON NÉGOCIABLES)

- **Jamais de token statique côté app comme authentification.** Auth réelle via Supabase (sessions).
- **Isolation stricte des données entre organisations** (RLS sur `org_id`). Une org ne doit JAMAIS voir les données d'une autre. Si ce n'est pas garanti, ne rien mettre en production.
- **Upload audio par URL signée** vers storage EU. L'audio ne transite jamais en clair via un webhook public non contrôlé.
- **Hébergement UE + chiffrement** au repos et en transit, dès le départ.
- **Purge automatique** : durée de conservation définie sur audio + transcriptions, suppression auto. Pas d'accumulation infinie.
- **Pas de réutilisation des transcriptions** pour entraîner un modèle.
- **Validation humaine obligatoire avant qu'une tâche déclenche relance/escalade/sanction.** Flux : l'IA *propose* (titre, assignee, échéance) → un humain confirme/corrige d'un tap → `validated_by_human = true` → seulement alors le timer démarre. Une tâche non validée ne peut PAS générer de relance ni de sanction. Raison : la chaîne parole→transcription→interprétation LLM est faillible, et sanctionner sur une erreur tue la confiance (et pose un problème de droit du travail FR).
- Le mot « sanctions » sur de vrais salariés : ne pas l'exposer dans le produit vendu sans cadrage juridique.

> Ces règles priment sur toute demande de raccourci. En cas de doute sur l'isolation des données, s'arrêter et demander.

---

## 9. Modèles économiques (contexte, pour cohérence produit)

Le pricing n'est pas au siège (le coût suit les minutes, pas les têtes). Trois modèles possibles, le n°1 est le défaut :

1. **Forfait par entité + quota de minutes** (recommandé) — ex. 99 €/mois, ≤10 sièges, 3 000 min ; overage par blocs.
2. **Base fixe + consommation** — ex. 29 €/mois + 0,04 €/min au-delà d'un inclus.
3. **Freemium plafonné en minutes → premium** — phase 2 uniquement.

Implication dev : prévoir `plan`, `minutes_quota`, compteur de minutes, et hooks Stripe.

---

## 10. Ordre de construction recommandé

1. Auth + organisations + RLS (la fondation d'isolation).
2. Capture (audio URL signée) + pipeline transcription/extraction hybride.
3. Tâches + validation humaine + anti-collision.
4. Rapport quotidien (réutiliser le format HTML existant) + accusé de lecture.
5. Relance/escalade (seulement sur tâches validées).
6. Facturation Stripe + quotas/compteur de minutes.
7. Purge auto + page conformité.
8. (Phase 2) brief audio, intégrations sortantes Linear/Asana/Notion/Slack, réservation de ressources.

---

## 11. Conventions

- Code et commentaires en français acceptés ; noms de variables/colonnes en anglais.
- Mobile-first strict sur tout le front.
- Copy UI : voix active, phrases simples, nommer par ce que l'utilisateur contrôle (« Marquer comme lu », pas « update read flag »).
- Toute fonctionnalité touchant aux données personnelles passe par les règles §8 sans exception.
- Avant de coder l'infra (choix Supabase/stockage/IA), confirmer avec Allan quelles stacks l'équipe possède déjà.
