#!/usr/bin/env bash
# =============================================================================
#  audit-hermes-vps.sh - Audit MEMOIRE d'Hermes (LECTURE SEULE)
# -----------------------------------------------------------------------------
#  But : decouvrir l'etat reel de la memoire d'Hermes sur le VPS, au regard du
#        stack de la video (MEMORY.md / soul.md / peer cards / dreaming / skill A:).
#
#  GARANTIES DE SURETE (ce script ne fait QUE lire) :
#    - Il NE cree, NE modifie, NE supprime, NE deplace AUCUN fichier.
#    - Il N'AFFICHE JAMAIS la valeur d'un secret : seulement "PRESENT" / "ABSENT".
#    - Il ne plante pas si un chemin manque : il le signale et continue.
#    - Aucune commande reseau, aucun push, aucun appel d'API.
#
#  USAGE :
#    bash audit-hermes-vps.sh                          # affiche le rapport
#    bash audit-hermes-vps.sh > rapport-audit.txt      # (option) sauvegarde
#
#  Copie le rapport ENTIER et renvoie-le a Allan / Claude pour decider la suite.
# =============================================================================

# Volontairement PAS de 'set -e' : on veut continuer meme si une verif echoue.
set -u 2>/dev/null || true
export LC_ALL=C 2>/dev/null || true

# --- Marqueurs visuels -------------------------------------------------------
OK="[ PRESENT ]"
NO="[ ABSENT  ]"
WARN="[  INFO   ]"

line()  { printf '%s\n' "------------------------------------------------------------"; }
title() { printf '\n============================================================\n  %s\n============================================================\n' "$1"; }

# Renvoie le 1er chemin existant d'une liste de candidats (fichier OU dossier).
first_existing() {
  local p
  for p in "$@"; do
    [ -e "$p" ] && { printf '%s' "$p"; return 0; }
  done
  return 1
}

# Affiche "label : PRESENT (chemin, date) / ABSENT" pour un FICHIER.
check_file() {
  local label="$1"; shift
  local found
  if found="$(first_existing "$@")" && [ -n "$found" ]; then
    local meta=""
    meta="$(date -r "$found" '+%Y-%m-%d %H:%M' 2>/dev/null || stat -c '%y' "$found" 2>/dev/null | cut -d. -f1 || true)"
    if [ -n "$meta" ]; then
      printf '  %-22s %s  ->  %s  (modifie: %s)\n' "$label" "$OK" "$found" "$meta"
    else
      printf '  %-22s %s  ->  %s\n' "$label" "$OK" "$found"
    fi
  else
    printf '  %-22s %s\n' "$label" "$NO"
  fi
}

# Cherche des fichiers par motif dans des racines, sans planter.
# N'affiche QUE le NOMBRE et les CHEMINS - jamais le contenu.
LAST_MATCH_LIST=""
count_matches() {
  local pattern="$1"; shift
  local roots=("$@")
  local r out total=0
  LAST_MATCH_LIST=""
  for r in "${roots[@]}"; do
    [ -d "$r" ] || continue
    while IFS= read -r out; do
      [ -n "$out" ] || continue
      LAST_MATCH_LIST="${LAST_MATCH_LIST}${out}"$'\n'
      total=$((total + 1))
    done < <(find "$r" -maxdepth 4 -iname "$pattern" -type f 2>/dev/null)
  done
  printf '%s' "$total"
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }

# =============================================================================
title "AUDIT MEMOIRE HERMES - $(date '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'date indisponible')"
printf '  Hote    : %s\n' "$(hostname 2>/dev/null || echo 'inconnu')"
printf '  Utilisateur courant : %s\n' "$(whoami 2>/dev/null || id -un 2>/dev/null || echo 'inconnu')"
printf '  HOME    : %s\n' "${HOME:-non defini}"
printf '\n  RAPPEL : ce script est en LECTURE SEULE. Il ne modifie rien\n'
printf '           et n affiche jamais la valeur d un secret.\n'

# --- Emplacements probables a inspecter --------------------------------------
ROOTS=(
  "${HOME:-/root}"
  "/root"
  "/home"
  "/app"
  "/workspace"
  "/data"
  "/srv"
  "/opt/hermes"
  "/opt/Hermes"
  "/hermes"
  "${HOME:-/root}/hermes"
  "${HOME:-/root}/Hermes"
  "${HOME:-/root}/work"
  "${HOME:-/root}/work/scribe-app"
  "/var/lib/hermes"
)
EXISTING_ROOTS=()
seen=""
for r in "${ROOTS[@]}"; do
  case " $seen " in *" $r "*) continue;; esac
  seen="$seen $r"
  [ -d "$r" ] && EXISTING_ROOTS+=("$r")
done

title "0) EMPLACEMENTS INSPECTES (existants seulement)"
if [ "${#EXISTING_ROOTS[@]}" -eq 0 ]; then
  printf '  %s Aucun dossier candidat trouve sur l hote.\n' "$WARN"
  printf '       -> La memoire vit peut-etre DANS un conteneur Docker (voir 6).\n'
else
  for r in "${EXISTING_ROOTS[@]}"; do printf '  - %s\n' "$r"; done
fi

# =============================================================================
title "1) MEMOIRE STRUCTUREE (le coeur de la video)"

check_file "MEMORY.md" \
  "${HOME:-/root}/MEMORY.md" \
  "${HOME:-/root}/memory/MEMORY.md" \
  "${HOME:-/root}/hermes/MEMORY.md" \
  "${HOME:-/root}/.hermes/MEMORY.md" \
  "/app/MEMORY.md" "/app/memory/MEMORY.md" \
  "/workspace/MEMORY.md" "/workspace/memory/MEMORY.md" \
  "/data/MEMORY.md" "/data/memory/MEMORY.md" \
  "/opt/hermes/MEMORY.md" "/opt/hermes/memory/MEMORY.md" \
  "/hermes/MEMORY.md"

m_count="$(count_matches 'MEMORY.md' "${EXISTING_ROOTS[@]}")"
printf '  %-22s %s trouve(s) par recherche elargie\n' "(MEMORY.md tous)" "${m_count:-0}"
if [ "${m_count:-0}" -gt 0 ] && [ -n "${LAST_MATCH_LIST:-}" ]; then
  printf '%s' "$LAST_MATCH_LIST" | sed 's/^/        ./'
fi

check_file "soul.md" \
  "${HOME:-/root}/soul.md" \
  "${HOME:-/root}/memory/soul.md" \
  "${HOME:-/root}/hermes/soul.md" \
  "${HOME:-/root}/.hermes/soul.md" \
  "/app/soul.md" "/app/memory/soul.md" \
  "/workspace/soul.md" "/data/soul.md" \
  "/opt/hermes/soul.md" "/hermes/soul.md"

s_count="$(count_matches 'soul.md' "${EXISTING_ROOTS[@]}")"
printf '  %-22s %s trouve(s) par recherche elargie\n' "(soul.md tous)" "${s_count:-0}"
if [ "${s_count:-0}" -gt 0 ] && [ -n "${LAST_MATCH_LIST:-}" ]; then
  printf '%s' "$LAST_MATCH_LIST" | sed 's/^/        ./'
fi

# --- Peer cards --------------------------------------------------------------
printf '\n  Peer cards (un fichier par personne) :\n'
pc_total=0
pc_list=""
for r in "${EXISTING_ROOTS[@]}"; do
  while IFS= read -r d; do
    [ -n "$d" ] || continue
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      pc_list="${pc_list}${f}"$'\n'
      pc_total=$((pc_total + 1))
    done < <(find "$d" -maxdepth 2 -iname '*.md' -type f 2>/dev/null)
  done < <(find "$r" -maxdepth 4 -type d \( -iname 'peer*' -o -iname 'peers' -o -iname 'peer-cards' -o -iname 'people' -o -iname 'contacts' \) 2>/dev/null)
done
for r in "${EXISTING_ROOTS[@]}"; do
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$pc_list" in *"$f"*) ;; *) pc_list="${pc_list}${f}"$'\n'; pc_total=$((pc_total + 1));; esac
  done < <(find "$r" -maxdepth 4 -type f -iname '*peer*card*.md' 2>/dev/null)
done
if [ "$pc_total" -gt 0 ]; then
  printf '    %s %d fichier(s) candidat(s) :\n' "$OK" "$pc_total"
  printf '%s' "$pc_list" | sed 's/^/        ./'
else
  printf '    %s 0 peer card trouvee\n' "$NO"
fi

# --- Index de sessions / recherche floue (bonus video) -----------------------
printf '\n  Index de sessions / recherche floue (optionnel) :\n'
sess_dir="$(first_existing \
  "${HOME:-/root}/sessions" "${HOME:-/root}/memory/sessions" \
  "/app/sessions" "/data/sessions" "/workspace/sessions" 2>/dev/null || true)"
if [ -n "${sess_dir:-}" ]; then
  n="$(find "$sess_dir" -maxdepth 3 -type f 2>/dev/null | wc -l | tr -d ' ')"
  printf '    %s %s  (%s fichier(s))\n' "$OK" "$sess_dir" "${n:-?}"
else
  printf '    %s aucun dossier de sessions repere\n' "$NO"
fi

# =============================================================================
title "2) BOUCLE D'AMELIORATION (cron / dreaming sequence)"

printf '  crontab utilisateur :\n'
if has_cmd crontab; then
  cron_out="$(crontab -l 2>/dev/null || true)"
  if [ -n "$cron_out" ]; then
    printf '    %s crontab non vide. Lignes (tokens masques par precaution) :\n' "$OK"
    printf '%s\n' "$cron_out" | sed -E 's/(sk-[A-Za-z0-9_-]{6,}|[A-Za-z0-9_-]{24,})/<masque>/g; s/^/        | /'
    if printf '%s' "$cron_out" | grep -Eiq 'dream|reveil|brief'; then
      printf '    %s Un motif type "dreaming/briefing matinal" SEMBLE present.\n' "$OK"
    else
      printf '    %s AUCUN cron de type "dreaming/briefing" detecte.\n' "$NO"
    fi
    if printf '%s' "$cron_out" | grep -Eiq 'prospect'; then
      printf '    %s Le cron "prospection" semble bien present (attendu : 9h).\n' "$OK"
    fi
  else
    printf '    %s crontab vide pour cet utilisateur.\n' "$NO"
  fi
else
  printf '    %s commande "crontab" indisponible ici.\n' "$WARN"
fi

printf '\n  cron systeme (presence des dossiers, pas le contenu sensible) :\n'
for c in /etc/crontab /etc/cron.d /etc/cron.daily /etc/cron.hourly; do
  if [ -e "$c" ]; then
    printf '    %s %s\n' "$OK" "$c"
  else
    printf '    %s %s\n' "$NO" "$c"
  fi
done

printf '\n  Timers systemd :\n'
if has_cmd systemctl; then
  t="$(systemctl list-timers --all --no-pager 2>/dev/null | grep -Ei 'dream|hermes|brief|prospect' || true)"
  if [ -n "$t" ]; then
    printf '    %s timer(s) pertinent(s) :\n' "$OK"
    printf '%s\n' "$t" | sed 's/^/        | /'
  else
    printf '    %s aucun timer systemd "hermes/dreaming" repere.\n' "$NO"
  fi
else
  printf '    %s systemctl indisponible (normal en conteneur).\n' "$WARN"
fi

# =============================================================================
title "3) REPO DE TRAVAIL scribe-app (clone de Claude Code)"
repo="$(first_existing \
  "${HOME:-/root}/work/scribe-app" \
  "${HOME:-/root}/scribe-app" \
  "/app/scribe-app" "/workspace/scribe-app" "/srv/scribe-app" 2>/dev/null || true)"
if [ -n "${repo:-}" ]; then
  printf '  %s %s\n' "$OK" "$repo"
  if [ -d "$repo/.git" ]; then
    br="$(git -C "$repo" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
    printf '    branche courante : %s\n' "$br"
    [ "$br" = "main" ] && printf '    %s sur "main" -> rappel : jamais coder directement sur main.\n' "$WARN"
    for f in CLAUDE.md HERMES.md snapshot.md; do
      [ -e "$repo/$f" ] && printf '    %s %s\n' "$OK" "$f" || printf '    %s %s\n' "$NO" "$f"
    done
  else
    printf '    %s dossier present mais pas un depot git (.git absent).\n' "$WARN"
  fi
else
  printf '  %s scribe-app introuvable dans les emplacements usuels.\n' "$NO"
  printf '       -> voir docs/setup-claude-code-vps.md 3 (clone via PAT).\n'
fi

# =============================================================================
title "4) SECRETS / .env  (PRESENCE SEULEMENT - jamais le contenu)"
printf '  Recherche de fichiers .env* (on n affiche NI le contenu NI les cles) :\n'
env_total=0
for r in "${EXISTING_ROOTS[@]}"; do
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    env_total=$((env_total + 1))
    sz="$(wc -c < "$f" 2>/dev/null | tr -d ' ' || echo '?')"
    printf '    %s %s  (%s octets)\n' "$OK" "$f" "${sz:-?}"
  done < <(find "$r" -maxdepth 4 -type f \( -iname '.env' -o -iname '.env.*' -o -iname '*.env' \) 2>/dev/null)
done
if [ "$env_total" -eq 0 ]; then
  printf '    %s aucun fichier .env repere sur l hote.\n' "$NO"
  printf '       (peut vivre dans le conteneur Docker - voir 6.)\n'
else
  printf '    -> %d fichier(s) .env trouve(s). VERIFIE QU AUCUNE cle du vrai\n' "$env_total"
  printf '       projet Supabase EU n y figure (mur deterministe). Au moindre\n'
  printf '       doute : on s arrete et on demande.\n'
fi

printf '\n  Cle Gemini (presence du NOM de variable uniquement) :\n'
gem_found="non"
if [ -n "${GEMINI_API_KEY:-}" ]; then
  printf '    %s variable GEMINI_API_KEY definie dans l environnement (valeur masquee).\n' "$OK"
  gem_found="oui"
fi
for r in "${EXISTING_ROOTS[@]}"; do
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if grep -qiE '^[[:space:]]*GEMINI_API_KEY[[:space:]]*=' "$f" 2>/dev/null; then
      printf '    %s nom "GEMINI_API_KEY" present dans : %s (valeur NON affichee)\n' "$OK" "$f"
      gem_found="oui"
    fi
  done < <(find "$r" -maxdepth 4 -type f \( -iname '.env' -o -iname '.env.*' -o -iname '*.env' \) 2>/dev/null)
done
[ "$gem_found" = "non" ] && printf '    %s aucune variable GEMINI_API_KEY reperee.\n' "$NO"

# =============================================================================
title "5) OUTILS (video / apprentissage 'A:')"
for tool in yt-dlp youtube-dl ffmpeg; do
  if has_cmd "$tool"; then
    v="$("$tool" --version 2>/dev/null | head -n1 || echo 'version inconnue')"
    printf '  %-22s %s  (%s)\n' "$tool" "$OK" "$v"
  else
    printf '  %-22s %s\n' "$tool" "$NO"
  fi
done
if ! has_cmd yt-dlp && has_cmd python3; then
  if python3 -m yt_dlp --version >/dev/null 2>&1; then
    printf '  %-22s %s (via "python3 -m yt_dlp")\n' "yt-dlp (module py)" "$OK"
  fi
fi

# =============================================================================
title "6) SOCLE TECHNIQUE (OS / Docker / Node)"
if [ -r /etc/os-release ]; then
  os_name="$(. /etc/os-release 2>/dev/null; printf '%s %s' "${NAME:-?}" "${VERSION:-}")"
  printf '  OS .................... %s\n' "${os_name:-inconnu}"
else
  printf '  OS .................... %s\n' "$(uname -a 2>/dev/null || echo inconnu)"
fi
printf '  Kernel ............... %s\n' "$(uname -r 2>/dev/null || echo '?')"

in_container="non"
if [ -f /.dockerenv ]; then in_container="oui (/.dockerenv)"; fi
if grep -qaE 'docker|containerd|kubepods' /proc/1/cgroup 2>/dev/null; then in_container="oui (cgroup)"; fi
printf '  Dans un conteneur ? .. %s\n' "$in_container"

for c in node npm git claude python3; do
  if has_cmd "$c"; then
    printf '  %-20s %s  (%s)\n' "$c" "$OK" "$($c --version 2>/dev/null | head -n1 || echo '?')"
  else
    printf '  %-20s %s\n' "$c" "$NO"
  fi
done

if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  printf '  CLAUDE_CODE_OAUTH_TOKEN  %s (defini dans l env - valeur masquee)\n' "$OK"
else
  printf '  CLAUDE_CODE_OAUTH_TOKEN  %s (pas dans CET env ; peut etre dans ~/.bashrc)\n' "$WARN"
fi

printf '\n  Docker (vue hote) :\n'
if has_cmd docker; then
  dps="$(docker ps --format '    {{.Names}}  |  image={{.Image}}  |  {{.Status}}' 2>/dev/null || true)"
  if [ -n "$dps" ]; then
    printf '%s\n' "$dps"
    hname="$(docker ps --format '{{.Names}}' 2>/dev/null | grep -i hermes | head -n1 || true)"
    if [ -n "$hname" ]; then
      printf '\n    %s Conteneur Hermes repere : "%s".\n' "$OK" "$hname"
      printf '       Si la memoire est A L INTERIEUR, relance la partie fichiers\n'
      printf '       DEPUIS le conteneur (lecture seule, sans rien modifier) :\n'
      printf '           docker exec -it %s sh -c "ls -la / /app /root /workspace 2>/dev/null"\n' "$hname"
      printf '           docker exec -it %s sh -c "ls -la /app/*.md /root/*.md 2>/dev/null"\n' "$hname"
    fi
  else
    printf '    %s aucun conteneur en cours (ou acces docker restreint).\n' "$WARN"
  fi
else
  printf '    %s commande "docker" indisponible ici (normal si on est DANS le conteneur).\n' "$WARN"
fi

# =============================================================================
title "SYNTHESE RAPIDE"
printf '  (relire le detail ci-dessus ; voici les 4 signaux a regarder en 1er)\n\n'
syn() { printf '  %-34s %s\n' "$1" "$2"; }
[ "${m_count:-0}" -gt 0 ] && syn "MEMORY.md (journal de bord)"     "$OK" || syn "MEMORY.md (journal de bord)"     "$NO"
[ "${s_count:-0}" -gt 0 ] && syn "soul.md (manifeste / objectifs)" "$OK" || syn "soul.md (manifeste / objectifs)" "$NO"
[ "${pc_total:-0}" -gt 0 ] && syn "Peer cards (relations)"         "$OK" || syn "Peer cards (relations)"         "$NO"
syn "Dreaming/cron matinal" "(voir section 2 ci-dessus)"

printf '\n'
line
printf '  FIN DE L AUDIT - LECTURE SEULE. Aucun fichier modifie.\n'
printf '  Copie ce rapport en ENTIER et renvoie-le pour decider la suite.\n'
line
exit 0
