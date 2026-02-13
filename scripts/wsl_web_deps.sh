#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"

DEPS_BASE="${HOME}/.deps/nutriagenda"
NODE_MODULES_DIR="${DEPS_BASE}/web-node_modules"
NEXT_CACHE_DIR="${DEPS_BASE}/web-next"

usage() {
  cat <<'USAGE'
Uso:
  ./scripts/wsl_web_deps.sh mount
  ./scripts/wsl_web_deps.sh umount
  ./scripts/wsl_web_deps.sh mount --with-next-cache
  ./scripts/wsl_web_deps.sh umount --with-next-cache

Por que existe:
  Si tu disco (por ejemplo D:) esta en exFAT, WSL NO puede crear symlinks en
  /mnt/d. npm/Next necesitan symlinks (por ejemplo en node_modules/.bin).

Este script guarda node_modules (y opcionalmente .next) en el filesystem Linux
(ext4) y lo monta dentro de web/ via bind mount.

Despues de 'mount':
  cd web
  npm ci
  npm run dev

Notas:
  - Te pedira tu password de sudo (normal en WSL).
  - Para deshacerlo, corre 'umount'.
USAGE
}

WITH_NEXT_CACHE=0
CMD="${1:-}"
shift || true

while [ $# -gt 0 ]; do
  case "$1" in
    --with-next-cache) WITH_NEXT_CACHE=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Argumento desconocido: $1" >&2; usage; exit 2 ;;
  esac
  shift
done

is_mounted() {
  local target="$1"
  findmnt -T "$target" >/dev/null 2>&1
}

ensure_dirs() {
  mkdir -p "$NODE_MODULES_DIR"
  if [ "$WITH_NEXT_CACHE" -eq 1 ]; then
    mkdir -p "$NEXT_CACHE_DIR"
  fi
}

do_mount() {
  ensure_dirs

  if is_mounted "$WEB_DIR/node_modules"; then
    sudo umount "$WEB_DIR/node_modules"
  fi

  rm -rf "$WEB_DIR/node_modules"
  mkdir -p "$WEB_DIR/node_modules"
  sudo mount --bind "$NODE_MODULES_DIR" "$WEB_DIR/node_modules"

  if [ "$WITH_NEXT_CACHE" -eq 1 ]; then
    if is_mounted "$WEB_DIR/.next"; then
      sudo umount "$WEB_DIR/.next"
    fi

    rm -rf "$WEB_DIR/.next"
    mkdir -p "$WEB_DIR/.next"
    sudo mount --bind "$NEXT_CACHE_DIR" "$WEB_DIR/.next"
  fi

  echo "OK: bind mounts listos."
  findmnt -T "$WEB_DIR/node_modules" || true
  if [ "$WITH_NEXT_CACHE" -eq 1 ]; then
    findmnt -T "$WEB_DIR/.next" || true
  fi
}

do_umount() {
  if is_mounted "$WEB_DIR/node_modules"; then
    sudo umount "$WEB_DIR/node_modules"
    echo "OK: node_modules desmontado."
  else
    echo "node_modules no estaba montado."
  fi

  if [ "$WITH_NEXT_CACHE" -eq 1 ]; then
    if is_mounted "$WEB_DIR/.next"; then
      sudo umount "$WEB_DIR/.next"
      echo "OK: .next desmontado."
    else
      echo ".next no estaba montado."
    fi
  fi
}

case "$CMD" in
  mount) do_mount ;;
  umount|unmount) do_umount ;;
  ""|-h|--help) usage; exit 0 ;;
  *) echo "Comando desconocido: $CMD" >&2; usage; exit 2 ;;
 esac
