# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Next.js 15 standalone image.
#
# Three stages so the final image carries no source, no dev dependencies and
# no build cache — roughly 180MB rather than ~1GB.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
# sharp and Next's SWC binaries need glibc shims on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app


# --- deps -------------------------------------------------------------------
# Separated so a change to application code does not re-run npm ci.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


# --- builder ----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are INLINED INTO THE JAVASCRIPT AT BUILD TIME.
# Passing this at `docker run` does nothing — it has to be a build arg, and
# changing it requires rebuilding the image, not just restarting the container.
ARG NEXT_PUBLIC_GTM_ID=""
ENV NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID

# SITE_URL is a build arg for the same reason, despite not being NEXT_PUBLIC_*.
# sitemap.xml, robots.txt and every page's canonical/OG tags are statically
# prerendered — that is why the site is fast — so the origin is baked into the
# output. Setting this at `docker run` changes nothing; it has to be here.
ARG SITE_URL=""
ENV SITE_URL=$SITE_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# --- runner -----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Never run the app as root.
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Lets Docker (and the deploy script) tell "started" from "actually serving".
# Hits `/` rather than a campaign route so this Dockerfile is identical across
# every landing page — `/` is the site index in all of them.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
