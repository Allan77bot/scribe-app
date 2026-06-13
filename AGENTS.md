# AGENTS.md — Capacités & apprentissage d'Hermes

> Tracker du chantier « rendre Hermes plus capable » : lire des vidéos, apprendre,
> mémoire Mem0. **Séparé du cœur Scribe** (base / RLS / auth, qui restent à Claude + Allan).
> Snapshot + prochaines étapes pour y voir clair. Mémoire associée : `hermes-memoire-mem0` (mémoire Claude).

---

## 📸 Snapshot — état au 2026-06-13

**Livré (à la racine du repo) :**
- `skillYTB.md` — Hermes peut lire des vidéos YouTube. Gemini officiel d'abord (URL → audio+image), `yt-dlp` en dépannage. **Testé : Gemini a regardé une vidéo de 23 min → OK.**
- `skillapprentissage.md` — skill `A: <lien>` : Hermes apprend d'une vidéo et écrit la leçon dans **Mem0**, taguée par domaine, validée par Allan.
- `skillnotebook.md` — NotebookLM : pas d'API pour le compte **Pro** (seulement Enterprise / MCP non officiel). **Mis de côté** (Allan évite le non-officiel).
- `memoire-agent-hermes.html` — doc visuel (mécanisme mémoire + skill A: + plan + audit).
- `audit-hermes-vps.sh` — diagnostic **lecture seule** du VPS.
- `manifeste-soul-hermes.md` — **le « soul » d'Hermes** : identité (co-gérant d'Atelier Klar), 3 piliers de l'année, hors-périmètre, métriques, règles de com + de permission. À charger en souvenir Mem0 « système ». **(étape 1 ✅)**

**Découvertes (audit VPS + exports Mem0) :**
- **Mémoire d'Hermes = Mem0 cloud** (pas de fichiers `.md`). Scopée par `user_id` (Allan ; Alphim/Shane) + `agent_id` (Hermes).
- **2 briques sur 5** de la vidéo déjà en place : souvenirs auto-extraits (≈ `MEMORY.md`) + peer cards (= les scopes `user_id`).
- **Manque :** manifeste « soul » (objectifs + règle de permission), skill `A:` branché sur Mem0, boucle « dreaming ».
- **VPS :** home `/home/hermes/.hermes/home/` ; conteneur minimal (ni `cron` ni `systemd`) → dreaming via le **scheduler interne** d'Hermes.

**Avancées (2026-06-13) :**
- **Vercel branché au repo + appli pushée** → Hermes a bossé sur le code pour de vrai. ⚠️ Ça déploie maintenant depuis le repo → **re-soulever la protection de `main`** (cf. mémoire `ecosysteme-atelier-klar-hermes`).
- **Hermes maîtrise les commandes** (bien assimilées).
- **Google scraper API** adopté pour la prospection (SERP plus pertinents que le scraping maison).

**Archi de routage (le « cheat code ») :**
- Hermes (DeepSeek) = **aiguilleur**. Claude Code (**Opus 4.8**, abo Allan) = **muscle qualité**. Gemini = **les yeux** (vidéo).
- Permissions : **Allan** (`1374851322`) seul = code lourd / skill `A:`. **Alphim·Shane** (`7533858975`) = crons / RDV / actus.

---

## ✅ Prochaines étapes

1. [x] **Écrire le manifeste « soul »** : 3 piliers de l'année + hors-périmètre + métriques + règles de com + règle de permission. → **fait** : `manifeste-soul-hermes.md` (validé Allan 2026-06-13), reste à le charger dans Mem0 en souvenir « système ».
2. [ ] **Brancher le skill `A:` sur Mem0** : `mem0.add(agent_id="hermes", metadata={domaine, statut, …})`. Code dans `skillapprentissage.md`.
3. [ ] **Boucle « dreaming »** : job `mem0.search()` sur les leçons validées, branché sur le scheduler interne d'Hermes (celui de la prospection 9h).
4. [ ] **Transmettre à Hermes** (Telegram) `skillYTB.md` + `skillapprentissage.md`. Vérifier qu'il a `GEMINI_API_KEY` + `MEM0_API_KEY`.
5. [ ] *(optionnel)* Garder `skillnotebook.md` en réserve si Google sort l'API NotebookLM grand public.

---

## 🚧 Garde-fous
- Tout passe par **PR validée par Allan** (règle d'or n°4). Jamais de secret commité.
- **Jamais de données client** dans le free tier Gemini, ni hors du périmètre UE.
