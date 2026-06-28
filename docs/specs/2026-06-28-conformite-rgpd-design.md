# Spec — Socle de conformité RGPD (contenu)

> **Date** : 2026-06-28 · **Branche** : `feat/conformite-rgpd` (depuis `feat/welcome-images`)
> **Statut** : design validé par Allan (brainstorming) → en attente de relecture spec avant plan.
> **Périmètre** : CONTENU SEUL (pages + documents). Aucune fonctionnalité backend.

---

## ⚖️ Avertissement juridique (à lire en premier)

Ces documents sont des **brouillons structurés**, ancrés sur la recherche de
`docs/etude-strategique.md` (sous-traitants IA, articles L.1222-4 / L.2312-38,
sanction CNIL SAN-2024-021). **Ils ne sont PAS validés juridiquement.** Avant toute
mise en ligne ou signature, les textes à portée contractuelle — **CGU, politique de
confidentialité, DPA** — doivent être **relus par un avocat/juriste**. Les passages
sensibles seront balisés `[À VALIDER PAR JURISTE]` dans le code.

---

## 1. Contexte & objectif

La conformité RGPD est le plus gros trou pour vendre (~8 % d'avancement au plan chiffré)
et le seul bloquant commercial réel avant une première vente — alors que le design est
à ~90 %. Décision actée le 2026-06-19 (ultracode) : **conformité minimale séquencée**.

Cette branche livre le **socle de contenu** : pages légales publiques + documents client,
sans toucher au backend (qui est bloqué par l'attente du Supabase payant). Objectif :
qu'un prospect PME « RGPD-regardant » trouve tout ce qu'il attend (hébergement UE,
sous-traitants UE, validation humaine, droits, DPA signable) et que Scribe IA soit
**légalement présentable**.

## 2. Décisions de cadrage (validées en brainstorming)

| Décision | Choix |
|---|---|
| Périmètre | **Contenu seul** — suppression d'organisation = branche séparée plus tard (backend + irréversible). |
| Entité éditrice | **Micro-entreprise Allan Morjon** (reco : passer en SASU au moment des premiers contrats B2B ; les docs sont conçus pour un swap d'identité simple). |
| Infos légales | **Vraies infos** fournies par Allan (voir §4). |
| Sous-traitants | **6**, liste confirmée complète (voir §5). |
| Cookies / analytics | **Pas de bannière de consentement.** Politique cookies = « essentiels + mesure d'audience anonyme exemptée ». Un outil cookieless (Plausible / Vercel Web Analytics) pourra être branché plus tard sans rien casser. GA4 / heatmaps + bannière = branche dédiée le jour venu. |
| Approche technique | **Option A** : pages React + route group `(legal)` + `LegalLayout` partagé. Zéro nouvelle dépendance, aucun risque Turbopack. |

## 3. Les deux casquettes RGPD (structure tout le contenu)

- **Données des employés des clients** → le **client est responsable de traitement**,
  **Scribe IA est sous-traitant**. Cadré par le **DPA** (art. 28 RGPD).
- **Visiteurs de la landing / prospects** (e-mail de contact, futur analytics) →
  **Scribe IA est responsable de traitement**. Cadré par la **politique de confidentialité**.

La politique de confidentialité traite **les deux**, clairement séparées.

## 4. Identité légale (mentions légales)

- **Service** : Scribe IA
- **Éditeur** : Allan Morjon — **micro-entreprise (entreprise individuelle)**
- **SIREN** : 878 736 784
- **Siège** : 12 rue de la Pierre Lorraine, 77440 Congis-sur-Thérouanne
- **Contact / exercice des droits** : contact@scribeia.fr
- **TVA** : non applicable, art. 293 B du CGI
- **Directeur de la publication** : Allan Morjon
- **Hébergeurs** (renseignés par Claude depuis la stack) :
  - Application : **Vercel Inc.** (region UE configurable) — 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com
  - Base de données / stockage / authentification : **Supabase** (données UE, Francfort) — supabase.com

> ⚠️ L'adresse du siège est l'adresse personnelle d'Allan (choix assumé). Alternative si
> besoin plus tard : société de domiciliation. Le swap micro → SASU n'impacte que ce §4 + le
> bloc signataire du DPA.

## 5. Sous-traitants (politique de confidentialité + annexe DPA)

| Sous-traitant | Finalité | Localisation données | Garanties |
|---|---|---|---|
| **Supabase** | Base de données, comptes, stockage des fichiers audio | UE (Francfort) | DPA + SCCs si maison-mère US |
| **Vercel** | Hébergement de l'application | UE (region configurable) | DPA + SCCs (éditeur US) |
| **OpenAI Ireland Ltd** | Transcription des notes vocales | UE | Rétention API 30 j, **pas d'entraînement** sur les données API |
| **Anthropic Ireland Ltd** | Extraction + synthèse IA | UE | SCCs, **pas d'entraînement** sur les données API |
| **Brevo (Sendinblue)** | E-mails transactionnels (invitations, confirmations) | France (Paris) | DPA |
| **Stripe Payments Europe** | Paiement des abonnements | UE (Irlande) | DPA |

## 6. Durées de conservation (à confirmer)

Valeurs **par défaut défendables** ; à confirmer par Allan/juriste. Note : **stater** ces
durées dans la politique ≠ **coder** une purge automatique (cette dernière reste hors scope,
décision « pas de J+30 deviné »).

| Donnée | Durée proposée |
|---|---|
| Compte & données d'organisation | Durée du contrat, puis suppression sous 30 j après résiliation (export sur demande) |
| Fichiers audio | Le temps nécessaire à la fonctionnalité ; supprimés avec l'entrée ou l'org. **[À CONFIRMER : suppression auto après transcription ? → lié à la purge auto, reportée]** |
| Transcriptions / tâches / rapports | Durée du contrat |
| Données de prospection (contact) | 3 ans après le dernier contact (norme CNIL B2B) |
| Données de facturation | 10 ans (obligation comptable, art. L.123-22 code de commerce) |
| Logs techniques | 6 à 12 mois |
| Cookie de session | Durée de la session |

## 7. Droits RGPD (politique de confidentialité)

Accès, rectification, effacement, limitation, opposition, portabilité, retrait du
consentement, et réclamation auprès de la **CNIL**. Contact : **contact@scribeia.fr**.
Pour les **données d'employés**, les droits s'exercent auprès du **client (responsable de
traitement)** ; Scribe IA, sous-traitant, relaie et assiste (obligation art. 28).

---

## 8. Livrables détaillés

### 8.1 Pages publiques (sans login)

#### `/conformite` — Hub Conformité (page de confiance/vente)
Le différenciateur. Ton : rassurant, factuel, voix active, vouvoiement. Sections :
- **Hébergement et IA en Europe** : données UE (Francfort), sous-traitants IA en Irlande.
- **« L'IA propose, l'humain valide »** : pas de décision entièrement automatisée (art. 22 RGPD respecté) — désamorce la peur de la surveillance.
- **Vos droits, simplement** : résumé des droits + contact.
- **Sous-traitants** : tableau §5 (transparence).
- **Documents** : liens vers Mentions légales, Politique de confidentialité, CGU, **DPA** (téléchargeable/imprimable), **Notice d'information des salariés**.
- **Renvoi** : kit CSE complet (clause règlement intérieur + checklist consultation) « disponible sur demande » ; politique de conservation détaillée à venir.

#### `/mentions-legales` — Obligation légale
Contenu du §4 (éditeur, SIREN, siège, contact, directeur de publication, hébergeurs, TVA).

#### `/confidentialite` — Politique de confidentialité
Structure : préambule (les 2 casquettes §3) · données collectées (par casquette) ·
finalités · base légale · sous-traitants (§5) · durées (§6) · transferts hors UE (SCCs) ·
sécurité (RLS par org, chiffrement, URL signées) · droits (§7) · cookies (essentiels +
mesure d'audience anonyme exemptée, **pas de traceur publicitaire**) · contact · date/version.

#### `/cgu` — Conditions Générales d'Utilisation (+ mention IA)
Objet · accès et compte · usage acceptable · **fonctionnement de l'IA** (transcription
OpenAI, extraction/synthèse Anthropic ; **l'IA propose, l'humain valide** ; la
transcription/extraction peut comporter des erreurs, l'utilisateur valide ; pas
d'entraînement sur les données) · abonnement et paiement (Stripe ; renvoi facturation) ·
responsabilités · résiliation · droit applicable (français) · date/version.
> CGV : pour l'instant **intégrées en section « Abonnement et paiement » des CGU** (billing
> à 45 %, pas le focus). CGV séparées = raffinement ultérieur.

### 8.2 Documents client (livrés via le hub)

#### `/conformite/dpa` — Accord de sous-traitance (art. 28 RGPD), imprimable
Parties (responsable = client `[à compléter par le client]` ; sous-traitant = Scribe IA,
Allan Morjon) · objet/durée/nature/finalité · catégories de données et de personnes ·
obligations du sous-traitant (instructions documentées, confidentialité, sécurité art. 32,
sous-traitants ultérieurs avec information préalable et droit d'objection, assistance,
notification de violation, suppression/restitution en fin de contrat, audit) ·
**Annexe 1** : sous-traitants ultérieurs (§5) · **Annexe 2** : mesures techniques et
organisationnelles. Rendu **imprimable en PDF** via styles `print:` du navigateur (pas de
librairie de génération PDF).

#### Notice d'information des salariés (art. L.1222-4) — texte à copier
Modèle que **le client** remet à ses employés : finalité (coordination/passation, **pas de
surveillance individuelle ni de notation**) · données traitées · base légale (intérêt
légitime / exécution du contrat de travail) · destinataires · sous-traitant (Scribe IA, UE) ·
durée · droits · **mention consultation CSE** (art. L.2312-38, ≥ 50 salariés)
`[à adapter par le client]`. Vit comme une **section copiable du hub** (pas de page séparée).

### 8.3 Intégration

- **`Footer`** (composant) : liens Mentions légales · Confidentialité · CGU · Conformité +
  « © Scribe IA ». Rendu sur la **landing** (`src/app/page.tsx`) et toutes les pages légales.
- **Case CGU à l'inscription** : checkbox **requise** « J'accepte les CGU et la politique de
  confidentialité » (liens ouverts dans un nouvel onglet) dans `(auth)/signup/page.tsx` +
  **vérification serveur** dans `signup` (`lib/auth/actions`) en défense (un POST direct sans
  la case doit être rejeté).

---

## 9. Architecture technique (Option A)

```
src/app/(legal)/
  layout.tsx                 → LegalLayout (chrome : retour accueil, conteneur prose, Footer, max-width, mobile-first)
  conformite/page.tsx        → Hub
  conformite/dpa/page.tsx    → DPA (styles print:)
  mentions-legales/page.tsx
  confidentialite/page.tsx
  cgu/page.tsx
src/components/
  Footer.tsx                 → liens légaux + copyright (réutilisé landing + legal)
  legal/Prose.tsx            → wrapper typographique (h2/h3/p/ul cohérents au design system)
  legal/LastUpdated.tsx      → badge « Dernière mise à jour : <date> · v<version> »
```

- **Routes publiques** : le middleware ne protège que `/dashboard/*` → ces routes passent
  sans modification de `proxy.ts`.
- **Design system** : tokens existants (`bg-surface`, `bg-card`, `text-on-surface`,
  `text-on-surface-variant`, `rounded-card`, `shadow-card`…). Compatible dark mode (`data-theme`).
- **Mobile-first strict** : `overflow-x` maîtrisé, rien qui dépasse, prose lisible 16px.
- **Vouvoiement** partout (cohérent avec la décision projet).
- **Métadonnées** : chaque page exporte `metadata` (title/description) ; pages **indexables**
  (le hub `/conformite` est aussi un actif SEO/confiance).
- **Versioning** : `version` + `lastUpdated` en constantes par document.
- **Aucune table, aucune migration** → `check:rls` non concerné, posture RLS inchangée.

## 10. Hors scope (explicite)

- **Suppression d'organisation** (fonctionnalité backend, irréversible) → branche dédiée.
- **Kit CSE complet** (clause règlement intérieur + checklist consultation) → « à la demande »,
  simple renvoi dans le hub.
- **Purge automatique des données** → pas de J+30 codé (décision projet).
- **Bannière de consentement cookies** → reportée (path cookieless).
- **Génération PDF par librairie** → on utilise l'impression navigateur (`print:`).
- **Choix + installation de l'outil analytics** → tâche marketing séparée.
- **Formulaire de contact** → l'e-mail `contact@scribeia.fr` suffit ; pas de formulaire codé ici.

## 11. Critères de succès / vérification

- `npm run build` **vert** ; `tsc` + `lint` propres.
- Les **4 pages** + le **DPA** s'affichent **sans login** (routes publiques).
- **Footer** présent sur landing + pages légales, tous les liens fonctionnels.
- **Mobile-first** : zéro overflow horizontal (vérif 393px).
- **Vouvoiement** partout, voix active.
- **Case CGU** à l'inscription : bloque côté client **et** côté serveur.
- DPA **imprimable** proprement (aperçu print correct).
- Tous les passages juridiques sensibles balisés `[À VALIDER PAR JURISTE]`.

## 12. Points nécessitant validation (Allan / juriste)

1. **Relecture juridique** de CGU + confidentialité + DPA par un avocat **avant mise en ligne**.
2. Confirmer les **durées de conservation** (§6), notamment l'**audio**.
3. Confirmer que **contact@scribeia.fr** est opérationnel (boîte qui reçoit).
4. Au passage **SASU** : mettre à jour §4 + bloc signataire du DPA.
5. Décider plus tard : suppression d'organisation (branche backend) + purge auto.
