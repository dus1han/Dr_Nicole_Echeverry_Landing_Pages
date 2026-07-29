# Deployment — VPS · Docker · GitHub Actions

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

| Name | Value |
|---|---|
| `VPS_HOST` | server IP or hostname |
| `VPS_USER` | SSH user (not root) |
| `VPS_SSH_KEY` | the **private** key from 2f, whole file including header/footer lines |
| `VPS_PORT` | SSH port — omit if 22 |
| `VPS_SITE_PATH` | `/opt/sites/dr-nicole-mommy-makeover` |
| `GHCR_USERNAME` | your GitHub username |
| `GHCR_PAT` | the `read:packages` token from 2e |

### Variables

| Name | Value |
|---|---|
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` — a **variable**, not a secret; it ships in the client bundle and is not confidential |

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

Confirmed on this machine before writing:

| Check | Result |
|---|---|
| `output: 'standalone'` produces a runnable server | ✅ `.next/standalone/server.js` |
| Standalone bundle serves pages | ✅ `/mommy-makeover`, `/thank-you`, `/robots.txt` all 200 |
| Image optimisation works in standalone | ✅ `/_next/image` returned an optimised JPEG |
| sharp and `@img` binaries traced | ✅ after adding `outputFileTracingIncludes` |
| Bundle size | 80MB standalone → ~180MB final image |

**Not yet verified:** the Docker image build itself. The Docker daemon was not running on
the machine where this was written, so `Dockerfile` and the workflow are written from the
verified standalone output but have not been executed. Expect to iterate once on the first
`docker build`.
