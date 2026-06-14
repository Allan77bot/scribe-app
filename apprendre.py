"""Skill « A: » d'Hermes — apprendre d'une vidéo et l'écrire dans Mem0.

Module runnable consolidant les outils du skill. La procédure complète, la
philosophie « Claude dans la boucle » et les recettes sont dans
`skillapprentissage.md` ; ICI vit le code exécutable (source de vérité unique).

Outils exposés :
- check_sender    : règle de permission (Allan seul déclenche A:)
- watch_video     : Gemini regarde la vidéo (les yeux)
- save_lesson     : écrit une leçon dans Mem0 (statut "propose")
- validate_lesson : passe une leçon en "valide_allan" (après OK d'Allan)
- dream           : relit les leçons validées -> briefing du matin (lecture seule)

Garde-fous : aucune écriture Mem0 sans validation d'Allan (règle d'or n°4) ;
vidéos PUBLIQUES uniquement ; jamais de données client dans Gemini free tier.
Clés attendues dans l'environnement : GEMINI_API_KEY, MEM0_API_KEY.
"""
from __future__ import annotations

import os

import requests
from mem0 import MemoryClient

ALLAN_ID = "1374851322"            # Telegram — seul autorisé à déclencher A:
GEMINI_MODEL = "gemini-3.5-flash"

_mem0 = None


def _client() -> "MemoryClient":
    """Client Mem0 paresseux (lit MEM0_API_KEY) — créé au 1er appel, pas à l'import."""
    global _mem0
    if _mem0 is None:
        _mem0 = MemoryClient()
    return _mem0


def check_sender(sender_id: str) -> bool:
    """Règle de permission : seul Allan déclenche A: (tâche lourde de code)."""
    if str(sender_id) != ALLAN_ID:
        raise PermissionError("Émetteur non autorisé — escalader à Allan avant d'exécuter.")
    return True


def watch_video(url: str) -> str:
    """Les yeux : Gemini regarde la vidéo PUBLIQUE et renvoie son analyse brute."""
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    prompt = ("Analyse cette vidéo (audio + écran). Donne 1 à 3 LEÇONS transférables "
              "et actionnables (pas un résumé), et le DOMAINE principal "
              "(marketing/ads/claude-code/saas/...). Pour chaque leçon : quand l'appliquer + comment.")
    payload = {"contents": [{"parts": [
        {"text": prompt},
        {"file_data": {"file_uri": url}},
    ]}]}
    r = requests.post(endpoint, headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]},
                      json=payload, timeout=600)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]


def save_lesson(content: str, domaine: str, source: str, date: str) -> str:
    """Écrit UNE leçon dans Mem0. Statut 'propose' tant qu'Allan n'a pas validé."""
    res = _client().add(
        messages=[{"role": "user", "content": content}],
        agent_id="hermes",
        metadata={"type": "lecon", "domaine": domaine,
                  "source": source, "date": date, "statut": "propose"},
        infer=False,
    )
    # mem0ai v2.0.5 : les résultats arrivent dans res['results'][0]['id']
    results = res.get("results", [])
    return results[0]["id"] if results else res.get("event_id", "")


def validate_lesson(memory_id: str, domaine: str, source: str, date: str) -> None:
    """Sur 'ok' d'Allan : la leçon devient active (relue par le dreaming)."""
    _client().update(
        memory_id=memory_id,
        metadata={"type": "lecon", "domaine": domaine, "source": source,
                  "date": date, "statut": "valide_allan"},
    )


def dream(focus: str, domaines: list[str], par_domaine: int = 3) -> str:
    """Boucle 'dreaming' (LECTURE SEULE) : relit les leçons VALIDÉES pertinentes
    pour la tâche du jour -> briefing compact. À appeler par le scheduler 9h d'Hermes."""
    lignes = []
    for d in domaines:
        hits = _client().search(
            query=focus, limit=par_domaine,
            filters={"agent_id": "hermes", "metadata": {"domaine": d, "statut": "valide_allan"}},
        )
        for h in hits:
            lignes.append(f"- [{d}] {h.get('memory') or h.get('content', '')}")
    if not lignes:
        return "Aucune leçon validée pertinente — rien à appliquer aujourd'hui."
    return "🧠 Briefing du jour (leçons à appliquer) :\n" + "\n".join(lignes)
