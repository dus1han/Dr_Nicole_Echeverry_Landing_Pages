#!/usr/bin/env bash
#
# Runs ON THE VPS, piped in over stdin by .github/workflows/deploy.yml.
#
# It arrives as a file on stdin rather than as an argument string, so nothing
# here passes through a shell-quoting layer. The workflow prepends the variable
# assignments it needs (SITE_PATH, GHCR_USERNAME, GHCR_PAT), each escaped with
# printf %q.
#
# Keeping it in the repository rather than inline in the YAML means it can be
# read, reviewed and — the point of this file — run by hand when a deploy fails:
#
#   ssh deploy@<host> 'SITE_PATH=/opt/sites/<site> bash -s' < deploy/remote-deploy.sh
#
set -uo pipefail

SITE_PATH="${SITE_PATH:-}"
GHCR_USERNAME="${GHCR_USERNAME:-}"
GHCR_PAT="${GHCR_PAT:-}"
SITE_URL="${SITE_URL:-}"

fail() { echo "::error::$*"; exit 1; }

echo "==> host $(hostname), user $(whoami)"

# --- locate the stack ------------------------------------------------------
# Checked explicitly rather than left to `cd`, because a bare `cd` into a
# missing directory writes to stderr and exits 1, which surfaces in CI as an
# exit code and nothing else. This is the most likely thing to be wrong on a
# first deploy, and it recurs after any rename of the site directory.
[ -n "$SITE_PATH" ] || fail "VPS_SITE_PATH is empty — set it in the repository secrets."

if [ ! -d "$SITE_PATH" ]; then
  echo "Directories that DO exist under /opt/sites:"
  ls -1 /opt/sites 2>/dev/null | sed 's|^|  /opt/sites/|' || echo "  (/opt/sites is missing)"
  fail "VPS_SITE_PATH does not exist on the server: '$SITE_PATH'"
fi

cd "$SITE_PATH" || fail "cannot enter $SITE_PATH"
[ -f .env ] || fail "no .env in $SITE_PATH — compose has no IMAGE, CONTAINER_NAME or SITE_PORT."

# A stale SITE_URL in .env is worse than none: it reads as authoritative while
# having no effect whatsoever, because the origin is baked in at build time (see
# lib/site-url.ts). Strip it so there is exactly one place the hostname lives —
# the SITE_URL repository variable.
if grep -q '^SITE_URL=' .env 2>/dev/null; then
  tmp=$(mktemp "$PWD/.env.XXXXXX")
  grep -v '^SITE_URL=' .env > "$tmp"
  chmod 644 "$tmp"
  mv "$tmp" .env
  echo "==> removed inert SITE_URL from .env (it is a build arg, not a runtime value)"
fi

# Report what the image was actually built with, so a wrong hostname shows up
# here rather than in Google Search Console weeks later.
img=$(grep '^IMAGE=' .env | cut -d= -f2-)
baked_origin() {
  docker image inspect "$img" --format '{{json .Config.Env}}' 2>/dev/null \
    | tr ',' '\n' | grep -o 'SITE_URL=[^"]*' | head -1 | cut -d= -f2-
}

echo "==> $SITE_PATH"
grep -v '^#' .env | grep -v '^$' | sed 's/^/    /'

command -v docker >/dev/null || fail "docker is not on PATH for this user."

# --- registry --------------------------------------------------------------
# A public repository publishes a public package, and a public package pulls
# anonymously. Only authenticate when a token was actually supplied — otherwise
# an unset secret becomes a `docker login` with an empty password, failing a
# deploy that had no need to log in at all.
if [ -n "$GHCR_PAT" ]; then
  echo "==> logging in to ghcr.io as $GHCR_USERNAME"
  echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin \
    || fail "GHCR login failed — check GHCR_PAT has read:packages."
else
  echo "==> no GHCR_PAT set; pulling anonymously (package must be public)"
fi

# --- pull and restart ------------------------------------------------------
echo "==> pulling"
docker compose pull || fail "docker compose pull failed. If the package is private, set GHCR_PAT + GHCR_USERNAME. If the image name is wrong, fix IMAGE= in .env."

# Compare what the freshly pulled image was built with against the variable this
# deploy was given. They disagree when the SITE_URL variable was changed without
# rebuilding — the deploy succeeds, the site serves, and every canonical URL and
# sitemap entry still points at the old host. Silent, and expensive to discover.
got=$(baked_origin)
if [ -n "$SITE_URL" ] && [ "${got%/}" != "${SITE_URL%/}" ]; then
  echo "::warning::Image was built with SITE_URL='${got:-<unset>}' but the variable is now '$SITE_URL'."
  echo "    The origin is baked in at build time. Re-run the workflow to rebuild;"
  echo "    restarting will not pick this up."
else
  echo "==> image origin: ${got:-<unset, defaults apply>}"
fi

echo "==> starting"
docker compose up -d --remove-orphans || fail "docker compose up failed."

# --- wait for healthy, not merely started ----------------------------------
# `up -d` returns as soon as the process starts, which is well before Next is
# answering requests. Reporting success there would call a broken deploy green.
echo "==> waiting for health"
cid=$(docker compose ps -q web)
[ -n "$cid" ] || fail "no 'web' container after up -d."

for i in $(seq 1 30); do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$cid" 2>/dev/null || echo starting)
  if [ "$status" = "healthy" ]; then
    echo "==> healthy after $((i * 5))s"
    docker ps --filter "id=$cid" --format '    {{.Names}} | {{.Status}} | {{.Ports}}'

    # Untagged layers accumulate fast and fill a small VPS disk.
    docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 5
done

echo "container never became healthy — last 50 log lines:"
docker compose logs --tail=50 web
fail "deploy failed health check after 150s."
