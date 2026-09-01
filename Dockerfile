# =============================================================================
# AZD Transport — Container image for Railway (or any Docker host)
# =============================================================================
# Three stages so the final image ships only what it needs to run: no source,
# no dev dependencies, no build cache. Measured result: about 430 MB.
# =============================================================================

# Debian slim rather than Alpine: Next.js ships native SWC binaries built
# against glibc, so this avoids the libc6-compat dance and a class of
# hard-to-debug native-module failures. Costs about 30 MB more.
FROM node:22-slim AS base
WORKDIR /app


# --- 1. Dependencies ---------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
# `npm ci` installs exactly the lock file, which keeps builds reproducible.
RUN npm ci


# --- 2. Build ----------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the browser bundle at BUILD time, so
# they must be present here — not just at runtime. Railway passes every service
# variable to the build as a build argument, but a Dockerfile only receives the
# ones it declares.
#
# Es gibt nur noch eine: die öffentliche Adresse. Alle übrigen Werte stehen
# in src/config/site.ts, und die Geheimnisse (E-Mail-Schlüssel) werden erst zur
# Laufzeit gelesen — in eine Image-Schicht gebacken wären sie für jeden lesbar,
# der das Image ziehen kann.
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Switches next.config.ts to the standalone output.
ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1

# `public/` is optional in this project (the favicon lives in app/), but the
# runner stage copies it unconditionally — so make sure it exists.
RUN mkdir -p public && npm run build


# --- 3. Runtime --------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# server.js binds to this address; 0.0.0.0 is required so the container is
# reachable from outside. Railway overrides PORT at runtime.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Never run the app as root.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
# The standalone bundle already contains the traced node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
