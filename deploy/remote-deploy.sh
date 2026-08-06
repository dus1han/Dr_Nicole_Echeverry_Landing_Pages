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
  # Tested explicitly rather than with `ls … | sed … || echo`. In that form the
  # `||` reads as a fallback but can never run: the exit status of a pipeline is
  # the status of its LAST command, and `sed` succeeds even when `ls` failed and
  # fed it nothing. The message would silently never appear.
  if [ -d /opt/sites ]; then
    echo "Directories that DO exist under /opt/sites:"
    ls -1 /opt/sites | sed 's|^|  /opt/sites/|'
  else
    echo "  (/opt/sites does not exist on this server)"
  fi
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

# --- keep the port private once a hostname exists ---------------------------
# BIND_ADDR=0.0.0.0 publishes the app's port straight to the internet. That is
# correct exactly once — while previewing before DNS exists and Caddy therefore
# cannot obtain a certificate.
#
# The moment SITE_URL is a real HTTPS hostname, Caddy is fronting the site and
# the raw port must stop answering, so the override is removed here rather than
# left to be noticed. compose already defaults BIND_ADDR to 127.0.0.1, so
# deleting the line is the whole fix.
#
# Derived rather than configured separately, for the same reason indexing is:
# a second switch meaning "we have gone live" is one more thing to forget, and
# forgetting this one leaves an uncertificated port open to the world.
if printf '%s' "$SITE_URL" | grep -q '^https://' && grep -q '^BIND_ADDR=' .env; then
  tmp=$(mktemp "$PWD/.env.XXXXXX")
  grep -v '^BIND_ADDR=' .env > "$tmp"
  chmod 644 "$tmp"
  mv "$tmp" .env
  echo "==> removed BIND_ADDR — $SITE_URL is live, so the port goes back behind Caddy"
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
elif [ -z "$got" ]; then
  # Says it out loud, because the consequence is invisible from the page: with
  # no origin configured the build is noindex, so a launched site would quietly
  # never appear in Google.
  echo "::warning::No SITE_URL — this build is NOINDEX and will not appear in search."
  echo "    Correct while previewing on an IP. Before launch, set the SITE_URL"
  echo "    repository variable to the real https:// hostname and re-run."
elif ! printf '%s' "$got" | grep -q '^https://'; then
  echo "::warning::SITE_URL is '$got' — not https, so this build is NOINDEX."
else
  echo "==> image origin: $got (indexable)"
fi

echo "==> starting"
docker compose up -d --remove-orphans || fail "docker compose up failed."

# --- wait for healthy, not merely started ----------------------------------
# `up -d` returns as soon as the process starts, which is well before Next is
# answering requests. Reporting success there would call a broken deploy green.
# --- warm the image optimizer ----------------------------------------------
# Next optimises images on FIRST REQUEST and caches the result. Straight after a
# deploy that cache is empty, so the first visitor to each page pays for every
# encode on it — and, once, three of those requests never came back at all,
# leaving the before/after gallery blank on desktop while the container sat idle
# at 0% CPU. A restart cleared it and it has not been reproducible since, so
# this is not presented as a root-cause fix.
#
# What it does do is make the deploy, rather than a visitor, the one that runs
# every encode. By the time traffic arrives the bytes are already on disk, which
# both removes that failure window and takes ~700ms per image off the first
# view. Paid ads land directly on these pages, so the first visitor is not a
# rounding error — they are the campaign.
#
# The URL list is read out of the served HTML rather than hardcoded, so a new
# page or a new photograph is covered without anyone remembering to add it.
warm_images() {
  command -v curl >/dev/null 2>&1 || { echo "==> curl unavailable; skipping image warm-up"; return; }

  port=$(grep '^SITE_PORT=' .env | cut -d= -f2-)
  [ -n "$port" ] || { echo "==> no SITE_PORT; skipping image warm-up"; return; }
  base="http://127.0.0.1:$port"

  # The browser Accept header. Without it the optimizer returns JPEG and warms
  # a variant no real browser will ever ask for.
  accept='image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'

  # Every page, from the sitemap the build already emits.
  paths=$(curl -fsS --max-time 20 "$base/sitemap.xml" 2>/dev/null \
    | grep -o '<loc>[^<]*</loc>' \
    | sed -e 's|</\?loc>||g' -e 's|https\?://[^/]*||' \
    | sed 's|^$|/|' | sort -u)
  [ -n "$paths" ] || { echo "==> could not read sitemap; skipping image warm-up"; return; }

  list=$(mktemp)
  for p in $paths; do
    # Only the widths real devices choose — measured at 360 on a phone and 640
    # on a 1440px laptop, with 828 for retina. Warming all ten srcset candidates
    # would triple the work to cache variants nothing requests.
    curl -fsS --max-time 20 "$base$p" 2>/dev/null \
      | grep -o '/_next/image?url=[^",[:space:]]*' \
      | sed 's/&amp;/\&/g' \
      | grep -E '[?&]w=(360|640|828)[&]' >> "$list" || true
  done
  sort -u "$list" -o "$list"

  n=$(wc -l < "$list" | tr -d ' ')
  if [ "$n" -gt 0 ]; then
    xargs -a "$list" -I{} -P 4 \
      curl -s -o /dev/null -H "Accept: $accept" --max-time 45 "$base{}" 2>/dev/null || true
    echo "==> warmed $n image variants across $(echo "$paths" | wc -l | tr -d ' ') pages"
  else
    echo "==> no optimised images found to warm"
  fi
  rm -f "$list"
}

echo "==> waiting for health"
cid=$(docker compose ps -q web)
[ -n "$cid" ] || fail "no 'web' container after up -d."

for i in $(seq 1 30); do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$cid" 2>/dev/null || echo starting)
  if [ "$status" = "healthy" ]; then
    echo "==> healthy after $((i * 5))s"
    docker ps --filter "id=$cid" --format '    {{.Names}} | {{.Status}} | {{.Ports}}'

    warm_images

    # Untagged layers accumulate fast and fill a small VPS disk.
    docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 5
done

echo "container never became healthy — last 50 log lines:"
docker compose logs --tail=50 web
fail "deploy failed health check after 150s."
