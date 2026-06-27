# Tests E2E sécurité (Playwright)

Suite de tests bout-en-bout centrée sur la **sécurité des formulaires** et la
**protection des données**. Pensée pour tourner à chaque modif et pour servir de
**filet de régression** des failles listées dans `docs/audit-securite-2026-06-27.md`.

## Lancer

```bash
npx playwright test                 # tout (démarre `npm run dev` tout seul)
npx playwright test --ui            # mode interactif (recommandé pour explorer)
npx playwright test --headed        # navigateur visible
npx playwright test --grep-invert @backend   # seulement ce qui ne nécessite pas Supabase
npx playwright show-report          # rapport HTML du dernier run
```

## Prérequis

- **App lancée** : la config démarre `npm run dev` automatiquement (ou réutilise un
  serveur déjà ouvert sur `localhost:3000`).
- **Backend Supabase joignable** pour les tests marqués **`@backend`** dans leur titre
  (inscription, connexion, endpoints API). Sans backend, lance uniquement les tests UI :
  `npx playwright test --grep-invert @backend`.
- ⚠️ Les tests `@backend` créent de **vrais comptes**. Les faire tourner contre un
  **projet/sandbox jetable**, jamais la prod réelle (cf. règle d'or n°2 du projet).
- **E-mails de test** : Supabase rejette les domaines sans MX (`exemple.com`,
  `example.com` → « Email address is invalid »). La suite génère des adresses à MX
  valide via `uniqueTestEmail()` (`payloads.ts`, domaine `mailinator.com`). Ne pas
  revenir à `@exemple.com`.
- **Migration `0013` appliquée sur le sandbox** : sinon le trigger `handle_new_user`
  insère `plan='free'` (invalide pour l'enum `org_plan`) → **toute inscription échoue**
  (« Database error saving new user »). Vérifié en direct le 2026-06-27.
- **Rate-limit e-mail** actif : enchaîner trop d'inscriptions déclenche
  `email rate limit exceeded` côté GoTrue (attendu — c'est aussi ce que teste
  `email-rate-limit.spec.ts`).

## Tests `test.fixme(...)` = failles connues

Certains tests sont volontairement en `test.fixme` : ils décrivent le comportement
**sécurisé attendu** d'une faille pas encore corrigée (référence `AS-xx` en commentaire).
Quand le correctif est livré, retirer le `.fixme` → le test devient un vrai garde-fou.

| Fichier | Couvre |
|---|---|
| `auth-signup.spec.ts` | validation inscription, anti-énumération, anti-XSS sur nom d'org |
| `route-protection.spec.ts` | redirections des routes protégées, garde `/onboarding` |
| `injection-payloads.spec.ts` | SQLi inoffensive + non-exécution de XSS sur /login |
| `security-headers.spec.ts` | CSP/HSTS/X-Frame-Options/… (AS-21) |
| `email-rate-limit.spec.ts` | rate-limit anti email-bombing (AS-04/AS-10) |
| `payloads.ts` | jeux de charges partagés (XSS, SQLi, prompt injection, abus) |

> Le **MCP Playwright** (pilotage navigateur en direct) est complémentaire : il sert à
> explorer/tester à la main. Cette suite, elle, est rejouable en une commande.
