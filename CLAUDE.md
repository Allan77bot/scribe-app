# Scribe IA — Index

> Routeur du projet. À lire en premier. Court par conception : le détail vit
> dans les fichiers pointés ci-dessous.

**Mission.** Transformer des notes vocales/écrites en **coordination d'équipe**
(suivi des tâches, accusés de lecture, rapport de passation automatique).
Ce n'est PAS un outil de transcription ni une mémoire passive — le centre de
gravité est la **coordination active**.

---

## Règles d'or — non négociables (détail : `docs/brief-produit.md` §8)

1. **Jamais de token statique comme auth.** Sessions Supabase uniquement.
2. **Isolation stricte par organisation** (RLS sur `org_id` partout). Une org ne
   voit JAMAIS les données d'une autre. En cas de doute → on s'arrête et on demande.
3. **Audio uploadé par URL signée**, storage UE. Jamais en POST direct via webhook.
4. **Validation humaine obligatoire** avant qu'une tâche déclenche relance/escalade.
   L'IA *propose*, un humain *confirme*, puis seulement le timer démarre.
5. **Stack IA hybride** : mini pour transcrire/extraire, modèle moyen seulement
   pour la synthèse du soir. Jamais le haut de gamme partout.

> Ces règles priment sur toute demande de raccourci.

---

## Où chercher

| Besoin | Fichier |
|---|---|
| Vision, modèle de données, archi cible, conformité, pricing | `docs/brief-produit.md` (spec canonique) |
| **Où on en est MAINTENANT** (à lire avant de coder) | `snapshot.md` |
| **Plan d'attaque** (prérequis + étapes feat/auth + roadmap + skills/commandes) | `docs/plan-attaque.md` |
| Journal daté des décisions et jalons | `historique.md` |
| Stack technique tranchée (infra, IA, comptes) | `docs/stack-technique.md` |
| Analyse du prototype (IP à garder, mapping, anti-patterns) | `docs/analyse-legacy.md` |
| Prototype existant (archive figée, ne pas modifier) | `legacy/` |

---

## Workflow Git — une préoccupation = une branche = une PR

Objectif : garder design, auth, capture, etc. **séparés et reviewables**.

- `main` = stable. **Ne jamais coder directement dessus.**
- **À chaque init** : lire `snapshot.md`, identifier le *concern* du jour, puis
  **créer ou choisir une branche dédiée**. Crée une nouvelle branche dès qu'on
  attaque un domaine différent — c'est attendu et fréquent.
- Ne jamais mélanger deux préoccupations dans une même branche. Si le travail
  déborde sur un autre domaine en cours de route → nouvelle branche.
- Nommage : `feat/<domaine>`, `fix/<sujet>`, `chore/<sujet>`, `docs/<sujet>`.
  Ex. `feat/auth`, `feat/design-system`, `feat/capture`, `feat/tasks`, `feat/rapport`.
- Push : `git push -u origin <branche>`. Ne pas ouvrir de PR sans accord explicite.

---

## Conventions (détail : `docs/brief-produit.md` §11)

- Code et noms de colonnes en **anglais** ; commentaires et docs en **français**.
- **Mobile-first strict** sur tout le front (`overflow-x:hidden`, rien qui dépasse).
- Copy UI en voix active, nommer par ce que l'utilisateur contrôle
  (« Marquer comme lu », pas « update read flag »).
- Avant de coder l'infra (Supabase/storage/IA), confirmer avec Allan quelles
  stacks l'équipe possède déjà.

---

## Avant chaque commit touchant la base — checklist

1. Toute nouvelle table de données est créée via `/nouvelle-table` (org_id + RLS + policy).
2. Lancer `/check-rls` (ou `npm run check:rls`) → doit être **vert** (aucune table à org_id sans RLS).
3. Jamais de clé `service_role` ni de secret côté client (uniquement `.env.local`, jamais commité).
4. Front : mobile-first (`overflow-x:hidden`, rien qui dépasse).

---

## Discipline de fin de session — NE PAS OUBLIER

Avant de terminer, **toujours** :
1. Réécrire `snapshot.md` pour refléter l'état présent (fait / en cours / next / blocages).
2. Ajouter une entrée **datée** dans `historique.md` (append-only, jamais réécrit).

C'est ce qui garde la coordination Discord vivante et évite la dérive entre les fichiers.
