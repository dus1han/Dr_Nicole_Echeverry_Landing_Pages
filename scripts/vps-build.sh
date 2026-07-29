#!/usr/bin/env bash
#
# Build and restart this site directly on the VPS.
#
# This is the BOOTSTRAP path, used before the GitHub Actions secrets exist.
# The normal route is .github/workflows/deploy.yml, which builds on GitHub's
# runners and has the server pull a finished image — see docs/deployment.md §1
# for why that is preferable.
#
# Usage, from your machine:
#
#   git archive --format=tar.gz -o site.tar.gz HEAD
#   scp site.tar.gz  root@<vps>:/opt/sites/<site>/site.tar.gz
#   scp scripts/vps-build.sh root@<vps>:/opt/sites/<site>/build.sh
#   ssh root@<vps> 'SITE_DIR=/opt/sites/<site> bash /opt/sites/<site>/build.sh'
#
# `git archive` rather than a plain copy, so what ships is exactly what is
# committed — no node_modules, no .next, no stray local edits.
#
# Environment:
#   SITE_DIR            defaults to /opt/sites/dr-nicole-mommy-makeover
#   NEXT_PUBLIC_GTM_ID  optional; omitted means a site with no analytics, which
#                       builds and runs perfectly well
#
set -euo pipefail

SITE_DIR="${SITE_DIR:-/opt/sites/dr-nicole-mommy-makeover}"
cd "$SITE_DIR"

# Fresh extraction every time: the tarball is the source of truth, so a file
# deleted upstream disappears here too rather than lingering in the build.
rm -rf src
mkdir -p src
tar -xzf site.tar.gz -C src

# The stack config lives one level up from the source, so re-extracting never
# clobbers the .env holding this site's port.
cp src/docker-compose.yml ./docker-compose.yml

if [ ! -f .env ]; then
  echo "!! no .env in $SITE_DIR — create it first:"
  echo "   IMAGE=<name>:latest"
  echo "   CONTAINER_NAME=<name>"
  echo "   SITE_PORT=31xx"
  echo "   BIND_ADDR=0.0.0.0   # only while no domain points here; remove once Caddy fronts it"
  exit 1
fi

echo "--- building (log: $SITE_DIR/build.log)"
cd src
if docker build \
      --build-arg NEXT_PUBLIC_GTM_ID="${NEXT_PUBLIC_GTM_ID:-}" \
      -t "$(grep '^IMAGE=' "$SITE_DIR/.env" | cut -d= -f2-)" . \
      > "$SITE_DIR/build.log" 2>&1; then
  echo "build ok"
else
  echo "BUILD FAILED — last 40 lines:"
  tail -40 "$SITE_DIR/build.log"
  exit 1
fi

cd "$SITE_DIR"
docker compose up -d --force-recreate

# Wait for healthy rather than assuming it: `up -d` returns as soon as the
# process starts, which is well before Next is serving.
echo "--- waiting for health"
for i in $(seq 1 30); do
  status=$(docker inspect --format='{{.State.Health.Status}}' \
    "$(docker compose ps -q web)" 2>/dev/null || echo starting)
  if [ "$status" = "healthy" ]; then
    echo "healthy after $((i * 5))s"
    exit 0
  fi
  sleep 5
done

echo "did not become healthy — recent logs:"
docker compose logs --tail=50 web
exit 1
