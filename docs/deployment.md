# Deployment — VPS · Docker · GitHub Actions

## Do these in order

Roughly 45 minutes the first time. Everything except step 9 is one-time for the whole
server — a second site is only steps 6, 8, 9.

| # | Where | Step |
|---|---|---|
| 1 | VPS | Install Docker, open ports 80/443 only |
| 2 | VPS | Create `/opt/sites/` layout |
| 3 | DNS provider | A record → VPS IP (**before** step 5) |
| 4 | GitHub | Create a `read:packages` token, log in to GHCR on the VPS |
| 5 | VPS | Start Caddy, confirm the certificate issues |
| 6 | VPS | Create the site folder + `.env` with a unique port |
| 7 | Local | Generate an SSH deploy key, put the public half on the VPS |
| 8 | GitHub | Add secrets + the `NEXT_PUBLIC_GTM_ID` variable (**optional** — see below) |
| 9 | Local | `git push` — Actions builds and deploys |

Detail for each is below. **Step 3 must happen before step 5**, or the certificate
request fails and Caddy backs off before retrying.

---

## About the GTM ID — it does not change when you push

Set `NEXT_PUBLIC_GTM_ID` once as a **repository variable** in GitHub. Every build from
then on reads the same value automatically. Pushing code does not touch it, clear it, or
require you to re-enter it. You only revisit it if the container itself changes.

It is passed as a Docker **build arg** because `NEXT_PUBLIC_*` values are compiled into
the JavaScript — they are not read at runtime. Two consequences:

- Setting it in `.env` on the VPS does **nothing**.
- Changing it needs a **rebuild** (push, or *Actions → Run workflow*), not a restart.

**A missing ID never blocks a deploy.** The workflow logs a warning and carries on, and
`Gtm.tsx` renders nothing at all when the variable is unset — no requests, no errors, no
console noise. Tracking is a marketing concern and should not be able to take the clinic's
page offline.

The warning matters anyway, because the failure is invisible: the build succeeds, the site
looks perfect, and it silently never fires a conversion — something you would otherwise
discover from an empty Google Ads report weeks later. Read the run summary after the first
deploy.

---

**This document is the pattern for every landing page on this server, not just this one.**
Sites 2, 3 and 4 follow the same steps; only the port, the domain and the repository
change. Section 6 is the short version for adding another.

---

## 1 · How it fits together

```
  git push main
        │
        ▼
  GitHub Actions  ──build──▶  ghcr.io/<owner>/<repo>:latest
        │                              │
        │ ssh                          │ docker compose pull
        ▼                              ▼
  ┌──────────────────────── VPS ────────────────────────┐
  │                                                     │
  │   Caddy  :80 :443  ── the only public listener      │
  │     │                                               │
  │     ├─ mommymakeover.dranicolecheverry.com          │
  │     │        └──▶ 127.0.0.1:3101  (container)       │
  │     ├─ breastaug.dranicolecheverry.com              │
  │     │        └──▶ 127.0.0.1:3102  (container)       │
  │     └─ buccalfat.drluisreyes.com                    │
  │              └──▶ 127.0.0.1:3103  (container)       │
  └─────────────────────────────────────────────────────┘
```

Each site is an independent Docker container bound to **127.0.0.1 only**. They are
reachable from the host — so Caddy can proxy to them and you can `curl` one while
debugging — but not from the internet. One process holds TLS, one process is exposed.

### Why these choices

| Decision | Reason |
|---|---|
| **Build on GitHub, not the VPS** | A 2GB VPS serves this app comfortably but struggles to build it. A failed build on the server is downtime; a failed build on a runner is just a red tick. |
| **Caddy over nginx + certbot** | Automatic certificate issue and renewal, no cron job to forget. Adding a site is three lines. |
| **Ports on 127.0.0.1** | Gives the per-port model you want without exposing anything. Only Caddy answers on 80/443. |
| **GHCR over Docker Hub** | Already tied to the repo's permissions, no extra account, no pull rate limits. |
| **`output: 'standalone'`** | ~180MB image instead of ~1GB. This app **cannot** be a static export — `/api/consultation` is a real server route. |

---

## 2 · One-time VPS setup

Ubuntu 22.04/24.04 assumed. Run as a sudo-capable non-root user.

### a. Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker            # or log out and back in
docker --version
```

### b. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status
```

Note there is **no rule for 3101, 3102…** — that is correct. Those ports are bound to
loopback and must never be reachable from outside.

### c. Folder layout

```bash
sudo mkdir -p /opt/sites/caddy/logs
sudo chown -R $USER:$USER /opt/sites
```

```
/opt/sites/
├── caddy/
│   ├── docker-compose.yml
│   ├── Caddyfile
│   └── logs/
├── dr-nicole-mommy-makeover/
│   ├── docker-compose.yml
│   └── .env
└── <next-site>/
    ├── docker-compose.yml
    └── .env
```

### d. Caddy

Copy `deploy/caddy-compose.yml` from this repo to `/opt/sites/caddy/docker-compose.yml`
and `deploy/Caddyfile.example` to `/opt/sites/caddy/Caddyfile`, then edit the domain and
email.

**Point DNS at the server before starting Caddy** (section 5). Caddy proves domain
ownership to Let's Encrypt over HTTP, so if the A record is not live yet the certificate
request fails and it will back off before retrying.

```bash
cd /opt/sites/caddy
docker compose up -d
docker compose logs -f     # watch for "certificate obtained successfully"
```

### e. Registry login

The image is private, so the server needs credentials. Create a GitHub **classic** token
with the single scope `read:packages` — nothing else.

```bash
echo 'ghp_xxxxxxxxxxxx' | docker login ghcr.io -u <github-username> --password-stdin
```

Stored in `~/.docker/config.json`. The workflow logs in again on every deploy, so this
step is really just to verify the token works.

### f. Deploy key for Actions

On your **local machine**:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ./deploy_key -N ""
```

Put the **public** half on the VPS:

```bash
ssh-copy-id -i ./deploy_key.pub user@your-vps-ip
```

The **private** half becomes the `VPS_SSH_KEY` GitHub secret. Then delete both local
files — GitHub has what it needs.

---

## 3 · Per-site setup on the VPS

```bash
mkdir -p /opt/sites/dr-nicole-mommy-makeover
cd /opt/sites/dr-nicole-mommy-makeover
```

Copy `docker-compose.yml` from the repo root, then create `.env`:

```bash
cat > .env <<'EOF'
IMAGE=ghcr.io/dus1han/dr_nicole_echeverry_landing_pages:latest
CONTAINER_NAME=dr-nicole-mommy-makeover
SITE_PORT=3101
EOF
```

> **`SITE_PORT` must be unique on this server.** Keep a running list — 3101, 3102, 3103…
> Two sites on the same port means the second container silently fails to start.

First pull and start:

```bash
docker compose pull && docker compose up -d
curl -I http://127.0.0.1:3101/mommy-makeover     # expect 200
```

---

## 4 · GitHub configuration

**Settings → Secrets and variables → Actions**

### Secrets

| Name | Value for this server |
|---|---|
| `VPS_HOST` | `169.58.92.105` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | contents of `~/.ssh/github_actions_drnicole` — the **private** half, whole file including the `-----BEGIN`/`-----END` lines |
| `VPS_PORT` | omit — SSH is on 22 |
| `VPS_SITE_PATH` | `/opt/sites/dr-nicole-mommy-makeover` |
| `GHCR_USERNAME` | `dus1han` |
| `GHCR_PAT` | a classic PAT with `read:packages` only |

`deploy` is an unprivileged account in the `docker` group, created specifically for this.
Docker group membership is close to root in practice, but it is still the difference
between *can manage containers* and *can do anything*, and it can be revoked on its own
without disturbing admin access. It uses a **different key** from the admin one, so a leak
of the GitHub secret costs you the deploy path, not the server.

### Variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` — a **variable**, not a secret; it ships in the client bundle and is not confidential |

**Optional.** Leave it unset and deploys still succeed; the site just runs without
analytics. Add it later and re-run the workflow — no code change needed.

Set it at **Settings → Secrets and variables → Actions → Variables → New repository
variable**. It survives every subsequent push; you never re-enter it.

> ### The one thing that catches everyone
> `NEXT_PUBLIC_*` values are **compiled into the JavaScript at build time**, which is why
> the workflow passes it as a Docker `build-arg` rather than a container environment
> variable. Setting it in `.env` on the VPS does nothing at all. **Changing it requires a
> rebuild — a restart will not pick it up.**

---

## 5 · DNS at your subdomain provider

For each site, one record:

| Type | Name | Value | TTL | Proxy |
|---|---|---|---|---|
| `A` | `mommymakeover` | your VPS IPv4 | 300 | **DNS only** |

If the provider is Cloudflare, set the cloud to **grey (DNS only)** until Caddy has
issued the certificate. Orange-cloud proxying intercepts the HTTP challenge and the
certificate never arrives. Switch it to orange afterwards if you want Cloudflare's CDN.

Confirm before starting Caddy:

```bash
dig +short mommymakeover.dranicolecheverry.com
```

---

## 6 · Adding another site — the short version

Everything above is one-time. A new landing page is five steps:

1. **Pick the next free port** — 3102, 3103… and note it in your list.
2. **On the VPS:**
   ```bash
   mkdir -p /opt/sites/<new-site> && cd /opt/sites/<new-site>
   # copy docker-compose.yml from that repo
   cat > .env <<'EOF'
   IMAGE=ghcr.io/<owner>/<repo>:latest
   CONTAINER_NAME=<new-site>
   SITE_PORT=3102
   EOF
   ```
3. **Add to `/opt/sites/caddy/Caddyfile`:**
   ```
   newsite.example.com {
       reverse_proxy 127.0.0.1:3102
       encode gzip zstd
   }
   ```
   then `cd /opt/sites/caddy && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile`
   — reload, not restart, so the other sites never drop a request.
4. **DNS:** A record → same VPS IP.
5. **In the new repo:** copy `Dockerfile`, `.dockerignore`, `docker-compose.yml` and
   `.github/workflows/deploy.yml`, set the same GitHub secrets with `VPS_SITE_PATH`
   pointing at the new folder, and push.

Sites are fully independent: different repos, different images, separate containers.
One can be rebuilt or fall over without touching the others.

---

## 7 · Operations

```bash
cd /opt/sites/<site>

docker compose logs -f web              # live logs
docker compose ps                       # health status
docker compose restart web              # restart
docker compose down && docker compose up -d
```

### Roll back

Every build is also tagged with its commit SHA:

```bash
# find the previous tag
docker images ghcr.io/<owner>/<repo>

# pin it
sed -i 's|:latest|:sha-<commit>|' .env
docker compose up -d
```

Revert `.env` to `:latest` once the next good build ships.

### Disk

Old image layers fill a small VPS quickly. The workflow prunes automatically, but
manually:

```bash
docker system df
docker image prune -af --filter "until=168h"
```

### Certificates

Caddy renews on its own. To check:

```bash
cd /opt/sites/caddy && docker compose logs | grep -i certificate
```

---

## 8 · Troubleshooting

| Symptom | Cause |
|---|---|
| **502 from Caddy** | Container is down or on a different port. `docker compose ps`, then `curl -I http://127.0.0.1:<port>/` |
| **Certificate never issues** | DNS not pointing at the server yet, or Cloudflare proxy is orange. Check `dig`, then Caddy's logs |
| **GTM tag not firing in production** | `NEXT_PUBLIC_GTM_ID` was set as a container env var instead of a build arg, or the image was not rebuilt after setting it. View source and search for `GTM-` |
| **Images 500 in the container** | sharp missing from the standalone bundle. `outputFileTracingIncludes` in `next.config.ts` handles this — see section 9 |
| **Deploy job fails at `docker login`** | `GHCR_PAT` expired or lacks `read:packages` |
| **Container restarts repeatedly** | `docker compose logs web`. Usually a missing runtime env var |
| **Port already allocated** | Two sites share a `SITE_PORT`. Check with `sudo ss -ltnp \| grep 31` |

---

## 9 · Next.js-specific gotchas in this setup

**`output: 'standalone'` is required** and already set. Without it the image carries the
whole `node_modules` tree.

**sharp is not traced automatically.** Next loads it at runtime to optimise images rather
than importing it, so the dependency tracer leaves it out — the container then starts
cleanly and only fails when the first image is requested, which is the worst kind of
failure because the deploy looks successful. `next.config.ts` forces it in via
`outputFileTracingIncludes`, including the `@img/*` platform binaries. Inside the Alpine
build those resolve to the linux-musl variants.

**Alpine needs `libc6-compat`** for sharp and Next's SWC binaries. It is in the Dockerfile.

**The placeholder-content check runs during `npm run build`.** It warns and continues, so
it will not fail the image build — but the warning appears in the Actions log naming the
blocks still using dummy content. That is intentional.

**Do not run `next build` locally while a dev server is running.** They share `.next` and
the dev server will start serving a half-written build. This has produced both phantom
500s and an "everything is 17px" accessibility failure during this project.

---

## 10 · Verified

| Check | Result |
|---|---|
| `output: 'standalone'` produces a runnable server | ✅ `.next/standalone/server.js` |
| Standalone bundle serves pages | ✅ `/mommy-makeover`, `/thank-you`, `/robots.txt` all 200 |
| Image optimisation works in standalone | ✅ `/_next/image` returned an optimised JPEG |
| sharp and `@img` binaries traced | ✅ after adding `outputFileTracingIncludes` |
| **Docker image builds** | ✅ on the VPS, first attempt, no iteration needed |
| **Final image size** | ✅ 345MB |
| **Container reaches `healthy`** | ✅ via the `HEALTHCHECK` in the Dockerfile |
| **Serves publicly** | ✅ 200 / 257KB fetched from a different machine |

---

## 11 · The live deployment

**Server** `169.58.92.105` · Contabo · Ubuntu 24.04.4 LTS · 6 vCPU · 12GB RAM · 191GB free

| | |
|---|---|
| Site directory | `/opt/sites/dr-nicole-mommy-makeover` (owned by `deploy`) |
| Port | **3101** |
| Container | `dr-nicole-mommy-makeover` |
| Image *(running)* | `dr-nicole-mommy-makeover:latest`, built on the server |
| Image *(`.env`)* | `ghcr.io/dus1han/dr_nicole_echeverry_landing_pages:latest` |
| URL | `http://169.58.92.105:3101/mommy-makeover` |
| Docker | 29.6.2 · Compose v5.3.1 |
| GTM | not configured — the site runs without it |

`.env` already points at the GHCR tag, so the first successful Actions run replaces the
hand-built image with the registry one. The container keeps running the old image until
that happens.

> **The image name is lowercase and the repository is not.** `docker/metadata-action`
> lowercases it, because Docker rejects uppercase in image references. Confirm the exact
> name at **github.com/dus1han?tab=packages** after the first build — if it differs, fix
> the one `IMAGE=` line in `.env`.

### Two ways this differs from the target architecture

**1 · The image is built on the server, not pulled from GHCR.** The GitHub Actions path
needs the secrets in §4, which require account access. Until those exist, the bootstrap
route is: `git archive` the tree → `scp` it to `/opt/sites/<site>/site.tar.gz` →
`bash build.sh`, which extracts, builds and restarts. The server has 6 cores and 12GB, so
it builds comfortably — the "never build on the VPS" advice in §1 assumes a 2GB droplet.

**2 · The port is bound to `0.0.0.0`, not `127.0.0.1`.** No domain points at this server
yet, so Caddy cannot complete an ACME challenge and there is no HTTPS to proxy through.
`BIND_ADDR=0.0.0.0` in `.env` exposes 3101 directly so the page can be previewed.

> ⚠️ **This is HTTP with no certificate.** Traffic — including anything typed into the
> consultation form — crosses the network in the clear. Fine for review, not for a live
> ad campaign.

### Closing both gaps

Once a subdomain exists:

1. Add the A record (§5), confirm with `dig +short <subdomain>`
2. Start Caddy (§2d) with a block for the subdomain proxying to `127.0.0.1:3101`
3. Delete `BIND_ADDR=0.0.0.0` from `/opt/sites/dr-nicole-mommy-makeover/.env` — it
   reverts to `127.0.0.1` and the port stops being reachable from the internet
4. `docker compose up -d` in that directory
5. Add the GitHub secrets (§4) so pushes deploy themselves

### Server access

Key-based root SSH is installed (`~/.ssh/vps_drnicole` on the build machine):

```bash
ssh -i ~/.ssh/vps_drnicole root@169.58.92.105
```

The firewall is **inactive** (`ufw` not enabled, iptables policy `ACCEPT`), so every port
is currently reachable. Step 2b closes this and should be done before the site takes real
traffic.
