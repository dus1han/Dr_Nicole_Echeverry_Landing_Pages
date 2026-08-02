# Deployment — VPS · Docker · GitHub Actions

## Do these in order

Roughly 45 minutes the first time. Steps 1–5 and 7 are **one-time for the whole server**;
a second *project* repeats only 3, 6, 8, 9 — see [§6](#6--adding-another-landing-page-vs-another-project).

| # | Where | Step | Per |
|---|---|---|---|
| 1 | VPS | Install Docker | server |
| 2 | VPS | Create the `/opt/sites/` layout | server |
| 3 | DNS provider | A record → VPS IP (**before** step 5) | project |
| 4 | GitHub | *Private package only* — `read:packages` token, log in to GHCR on the VPS | server |
| 5 | VPS | Start Caddy, confirm the certificate issues | server |
| 6 | VPS | Site folder + `.env` with a unique port | project |
| 7 | VPS + local | Create the `deploy` user and its SSH key | server |
| 8 | GitHub | Add secrets; `NEXT_PUBLIC_GTM_ID` variable is **optional** | project |
| 9 | Local | `git push` — Actions builds and deploys | project |
| 10 | VPS | Enable the firewall — 22/80/443 only | server |

Detail for each is below. **Step 3 must happen before step 5**, or the certificate
request fails and Caddy backs off before retrying.

> **Another *page* for a client you already host is none of this.** It is a route in an
> existing repo and a `git push` — no port, no container, no DNS, no Caddy. See §6.

---

## The origin is a build-time value

`SITE_URL` is the site's public address — `https://mommymakeover.example.com`. It feeds
`sitemap.xml`, `robots.txt`, the canonical tags, the OG tags and the JSON-LD.

Set it **once** as a repository **variable** (not a secret — it is the site's own public
address):

**Settings → Secrets and variables → Actions → Variables → `SITE_URL`**

| Name | Value |
|---|---|
| `SITE_URL` | `https://mommymakeover.example.com` — no trailing slash |

> ### Setting this on the server does nothing
> `sitemap.xml`, `robots.txt` and every page's metadata are **statically prerendered
> during `next build`** — that is what makes the site fast. The origin is compiled into
> the output. Putting `SITE_URL` in the VPS `.env` looks authoritative and has no effect
> whatsoever; the deploy script now deletes it from `.env` if it finds it, and prints what
> the image was actually built with.
>
> Changing the hostname is therefore a **rebuild** — push, or *Actions → Run workflow* —
> not a restart.

Leave it unset and the site falls back to the default in `lib/site-url.ts`. Everything
works; the sitemap simply advertises a host that may not serve the page, which Google
acts on and nobody notices from looking at the site.

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
| **GHCR over Docker Hub** | Already tied to the repo's permissions, no extra account, no pull rate limits. A public package also needs no login on the server. |
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
├── dr-nicole-landing-pages/
│   ├── docker-compose.yml
│   └── .env
└── <next-site>/
    ├── docker-compose.yml
    └── .env
```

### d. Caddy

> ### ⚠ Caddy already exists on this server, and its Caddyfile is SHARED
> `/opt/sites/caddy/` is set up and running as of 2 Aug 2026, fronting every site on the
> box. **Do not follow the first-time instructions below on this server** — they are for a
> fresh one.
>
> `/opt/sites/caddy/Caddyfile` holds a global `{ email … }` block plus one block per site,
> for **different clients**. **Append to it; never overwrite it.** Writing the file with
> `>` instead of `>>`, or copying `Caddyfile.example` over it, takes every other client's
> site down. Back it up first — `cp Caddyfile Caddyfile.bak.$(date +%F-%H%M%S)`.
>
> Adding a site is [§6f](#f-caddy). Validate, then **reload, never restart**.

First-time setup on a *new* server: copy `deploy/caddy-compose.yml` from this repo to
`/opt/sites/caddy/docker-compose.yml` and `deploy/Caddyfile.example` to
`/opt/sites/caddy/Caddyfile`, then edit the domain and email.

**Point DNS at the server before starting Caddy** (section 5). Caddy proves domain
ownership to Let's Encrypt over HTTP, so if the A record is not live yet the certificate
request fails and it will back off before retrying.

```bash
cd /opt/sites/caddy
docker compose up -d
docker compose logs -f     # watch for "certificate obtained successfully"
```

### e. Registry login — only if the package is private

**A public repository publishes a public package, and a public package pulls without any
credentials. Skip this step entirely in that case**, and leave `GHCR_USERNAME` /
`GHCR_PAT` unset; the workflow detects the missing token and pulls anonymously.

If the package is private, create a GitHub **classic** token with the single scope
`read:packages` — nothing else.

```bash
echo 'ghp_xxxxxxxxxxxx' | docker login ghcr.io -u <github-username> --password-stdin
```

Stored in `~/.docker/config.json`. The workflow logs in again on every deploy, so this
step is really just to verify the token works.

> Package visibility is **not** the same setting as repository visibility, and it does not
> always follow it. Check it under your profile's **Packages** tab → the package →
> *Package settings*.

### f. Deploy user and key for Actions

Actions gets its own unprivileged account and its own key — **never your admin login**.
Docker group membership is close to root in practice, but it is still the difference
between *can manage containers* and *can do anything*, it can be revoked on its own, and a
leak of the GitHub secret then costs you the deploy path rather than the server.

On the **VPS**, once for the whole server:

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
```

On your **local machine**, generate a key used for nothing else:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ./deploy_key -N ""
```

Append the **public** half to `/home/deploy/.ssh/authorized_keys` (`chmod 600`, owned by
`deploy`). The **private** half becomes the `VPS_SSH_KEY` secret — the whole file,
including the `-----BEGIN`/`-----END` lines; a partial paste is the most common cause of a
deploy failing on the key.

Verify before wiring up Actions, or you will be debugging two things at once:

```bash
ssh -i ./deploy_key deploy@<host> 'whoami; docker ps'
```

Then delete both local files — GitHub has what it needs.

---

## 3 · Per-site setup on the VPS

```bash
mkdir -p /opt/sites/dr-nicole-landing-pages
cd /opt/sites/dr-nicole-landing-pages
```

Copy `docker-compose.yml` from the repo root, then create `.env`:

```bash
cat > .env <<'EOF'
IMAGE=ghcr.io/dus1han/dr_nicole_echeverry_landing_pages:latest
CONTAINER_NAME=dr-nicole-landing-pages
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

| Name | Value | Required |
|---|---|---|
| `VPS_HOST` | server IP or hostname | ✅ |
| `VPS_USER` | `deploy` | ✅ |
| `VPS_SSH_KEY` | the **private** key for that user — the whole file, including the `-----BEGIN`/`-----END` lines | ✅ |
| `VPS_SITE_PATH` | `/opt/sites/dr-nicole-landing-pages` | ✅ |
| `VPS_PORT` | SSH port — omit if 22 | — |
| `GHCR_USERNAME` | your GitHub username | only if the package is **private** |
| `GHCR_PAT` | a classic PAT with `read:packages` only | only if the package is **private** |

**A public repository publishes a public package**, and a public package needs no
credentials to pull. Leave the two `GHCR_*` secrets unset in that case — the workflow skips
the registry login rather than failing. Set them only if you make the package private.

`deploy` should be an unprivileged account in the `docker` group, created for this purpose,
with a **key of its own** — not the key you use for admin access. Docker group membership
is close to root in practice, but it is still the difference between *can manage
containers* and *can do anything*, it can be revoked on its own, and a leak of the GitHub
secret then costs you the deploy path rather than the server.

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

## 6 · Adding another landing page vs. another project

**These are not the same thing, and confusing them is how you end up with a stack
per page.** Decide which you are doing before touching anything.

### Another page for the *same* client → nothing here applies

`/mommy-makeover`, `/breast-augmentation`, `/rhinoplasty` are **routes in one app**,
served by **one container on one port**. Adding one is:

1. A new content file and route in this repo — see
   [`adding-a-landing-page.md`](adding-a-landing-page.md)
2. `git push`

No new port. No new container. No new DNS record. No Caddy change. The root index picks
the page up automatically from `site.landingPages`. `SITE_PORT` distinguishes **clients**,
not routes — which is why the directory is named `dr-nicole-landing-pages` and not after
any one page.

### A different client or project → the checklist below

Separate repo, separate image, separate container, its own port and hostname. Fully
independent: one can be rebuilt or fall over without touching the others.

---

### a. Copy these files into the new repo, unchanged

```
Dockerfile                     multi-stage standalone build
.dockerignore                  must NOT exclude scripts/ if prebuild uses it
docker-compose.yml             reads IMAGE / CONTAINER_NAME / SITE_PORT / BIND_ADDR
deploy/remote-deploy.sh        what runs on the server
deploy/Caddyfile.example       reference only; the live one is server-wide
.github/workflows/deploy.yml   build → GHCR → ssh → pull → restart
lib/site-url.ts                one SITE_URL build arg instead of a hardcoded host
```

Nothing in them names this client, this port or this domain.

### b. Claim a port — keep the register current

| Port | Project | Hostname |
|---|---|---|
| 3101 | `dr-nicole-landing-pages` | `surgery.dranicolecheverry.com` |
| 3102 | `dr-luis-landing-pages` | `surgery.luisfernandoreyesmd.com` |
| 3103 | *free* | |
| 3104 | *free* | |

Both are bound to **127.0.0.1** and reachable only through Caddy.

> **Two projects on one port means the second container silently fails to start.**
> Nothing warns you; the old one just keeps serving. Write the port down here when you
> claim it.

### c. On the VPS

```bash
SITE=<new-project>            # e.g. dr-luis-landing-pages
PORT=3102

sudo mkdir -p /opt/sites/$SITE
sudo chown -R deploy:deploy /opt/sites/$SITE
cd /opt/sites/$SITE

# Only .env is created by hand. docker-compose.yml is shipped by every deploy,
# so changes to it in the repo actually reach the server — see §7.
sudo -u deploy tee .env >/dev/null <<EOF
IMAGE=ghcr.io/<owner>/<repo>:latest
CONTAINER_NAME=$SITE
SITE_PORT=$PORT
EOF
```

`.env` holds only what is genuinely per-installation. The hostname is **not** here — see
[the origin is a build-time value](#the-origin-is-a-build-time-value) below.

The `deploy` user from §2 is **shared across projects** — one account, one key, many site
directories. Only `VPS_SITE_PATH` differs per repo.

> `IMAGE` must be **all lowercase**. `docker/metadata-action` lowercases the repository
> name when it publishes; Docker rejects uppercase in image references. Check the exact
> name under the GitHub **Packages** tab after the first build.

Omit `BIND_ADDR` unless DNS is not ready yet — see §11.

### d. GitHub configuration on the new repo

**Variables:** `SITE_URL` — the new site's public address. Build arg; see
[the origin is a build-time value](#the-origin-is-a-build-time-value).
Optionally `NEXT_PUBLIC_GTM_ID`.

**Secrets** — four, all the same as this repo except the last:

| `VPS_HOST` · `VPS_USER` · `VPS_SSH_KEY` | identical to this project |
|---|---|
| `VPS_SITE_PATH` | `/opt/sites/<new-project>` |

`GHCR_USERNAME` / `GHCR_PAT` only if the package is private. Optionally the
`NEXT_PUBLIC_GTM_ID` **variable** — see [`conversion-tracking.md`](conversion-tracking.md),
which covers reusing one GTM container across several sites.

### e. DNS

One A record → the same VPS IP. §5.

### f. Caddy

**Append** to `/opt/sites/caddy/Caddyfile` — it is shared with every other client on the
box. Back it up first, then match the shape of the blocks already in it:

```bash
cd /opt/sites/caddy
cp Caddyfile "Caddyfile.bak.$(date +%F-%H%M%S)"

cat >> Caddyfile <<'EOF'

newsite.example.com {
    reverse_proxy 127.0.0.1:3103

    encode gzip zstd

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options    "nosniff"
        Referrer-Policy           "strict-origin-when-cross-origin"
        -Server
    }

    log {
        output file /var/log/caddy/newsite.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
EOF
```

Validate before reloading, and **reload rather than restart**:

```bash
docker compose exec -T caddy caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile
docker compose exec -T caddy caddy reload   --adapter caddyfile --config /etc/caddy/Caddyfile
```

A restart drops in-flight requests on every *other* site on the server. A reload validates
first and swaps atomically, so a typo fails loudly and changes nothing.

**DNS must resolve before you reload.** Caddy proves ownership over the connection; if the
A record is not live it fails the challenge and backs off before retrying, so the
certificate does not appear when you fix DNS a minute later.

### g. Push

The workflow builds, publishes and deploys. Watch the run: every stage names itself, and
each failure names its cause.

---

## 7 · Operations

```bash
cd /opt/sites/<site>

docker compose logs -f web              # live logs
docker compose ps                       # health status
docker compose restart web              # restart
docker compose down && docker compose up -d
```

### What a deploy actually replaces

| | |
|---|---|
| `docker-compose.yml` | **overwritten from the repo every deploy** |
| the image | pulled fresh from GHCR |
| `.env` | preserved, except that an inert `SITE_URL=` line is stripped, and `BIND_ADDR` is removed once `SITE_URL` is a live HTTPS host |
| the Caddyfile | **never touched** — it is shared with other clients and edited by hand |

Shipping the compose file matters more than it looks. Left as server state, it keeps
whatever copy was placed there on day one, and every later change — a new environment
variable, a changed port binding, a healthcheck tweak — is silently ignored while the
deploy still reports success. Pulling a new image and restarting genuinely did work; the
change simply never arrived.

Anything that must differ per installation belongs in `.env`, which is why that file is
deliberately excluded.

### Deploy by hand

`deploy/remote-deploy.sh` is the *same* script Actions pipes over SSH, kept as a file
precisely so you can run it yourself when a deploy misbehaves — identical steps, full
output, no CI in the way:

```bash
ssh deploy@<host> 'SITE_PATH=/opt/sites/<site> bash -s' < deploy/remote-deploy.sh
```

Being able to reproduce a CI failure locally is the difference between reading a stack
trace and guessing.

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

> **This repository is public.** Host addresses, SSH usernames and firewall state are
> deliberately not recorded here — publishing them is free reconnaissance. The real values
> live in the GitHub **Actions secrets** and in your own notes. Placeholders below.

| | |
|---|---|
| Host | *(Actions secret `VPS_HOST`)* |
| Site directory | `/opt/sites/dr-nicole-landing-pages`, owned by an unprivileged `deploy` user |
| Port | **3101** |
| Container | `dr-nicole-landing-pages` |
| Image | `ghcr.io/<owner>/<repo>:latest` — lowercased, see below |
| Public hostname | `surgery.dranicolecheverry.com` |
| Fronted by | Caddy on 80/443, `network_mode: host`, shared with other clients |
| Binding | **`127.0.0.1:3101`** — not reachable from the internet |
| TLS | Let's Encrypt, issued 2 Aug 2026 via `tls-alpn-01`, auto-renewing |
| Docker | 29.6.2 · Compose v5.3.1 |
| GTM | not configured — the site runs without it |

**The directory and container name the project, not a page.** One Next.js app serves every
landing page for this client — `/mommy-makeover` today, more later — from a single
container on a single port. `SITE_PORT` distinguishes *clients*, not routes. Adding page
#2 means a new route in this repo and a redeploy, not a new stack.

> **The image name is lowercase and the repository name is not.** `docker/metadata-action`
> lowercases it, because Docker rejects uppercase in image references. Confirm the exact
> published name under your GitHub **Packages** tab after the first build — if it differs,
> fix the one `IMAGE=` line in `.env`. A mismatch surfaces as an opaque
> `docker compose pull` failure that never names the cause.

### It now matches the target architecture

Caddy fronts it, the port is on loopback, and TLS is automatic. The preview arrangement
that ran until 2 Aug 2026 — `BIND_ADDR=0.0.0.0` exposing 3101 over plain HTTP — is gone,
and `deploy/remote-deploy.sh` now strips `BIND_ADDR` whenever `SITE_URL` is a live HTTPS
host, so it cannot quietly come back.

Measured from a machine outside the server after the change:

| Check | Result |
|---|---|
| `https://surgery.dranicolecheverry.com/mommy-makeover` | 200 |
| `http://` → `https://` | 308 |
| Certificate | `CN=surgery.dranicolecheverry.com`, Let's Encrypt, valid to 31 Oct 2026 |
| HSTS · nosniff · Referrer-Policy | all present |
| `http://169.58.92.105:3101` | no answer |
| The other client's site | still 200 |

### Still outstanding

**`ufw` is inactive.** Nothing listens publicly except Caddy on 80/443 and sshd on 22, so
the exposure is small — but a future container published on `0.0.0.0` would be reachable
with nothing to stop it. §2b closes it.

### Bootstrap build, if Actions is unavailable

`scripts/vps-build.sh` builds the image on the server instead: `git archive` the tree →
`scp` it to `/opt/sites/<site>/site.tar.gz` → run the script, which extracts, builds and
restarts. The "never build on the VPS" advice in §1 assumes a small droplet; a 6-core box
with 12GB builds this comfortably.
