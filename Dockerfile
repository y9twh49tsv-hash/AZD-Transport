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
# SUPABASE_SERVICE_ROLE_KEY is deliberately absent: it is only ever read on the
# server at runtime, and baking a secret into an image layer would leave it
# readable to anyone who can pull the image.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_BRAND_NAME
ARG NEXT_PUBLIC_BRAND_LEGAL_NAME
ARG NEXT_PUBLIC_TRACKING_PREFIX
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_CONTACT_PHONE
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_CONTACT_STREET
ARG NEXT_PUBLIC_CONTACT_ZIP
ARG NEXT_PUBLIC_CONTACT_CITY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_BRAND_NAME=$NEXT_PUBLIC_BRAND_NAME \
    NEXT_PUBLIC_BRAND_LEGAL_NAME=$NEXT_PUBLIC_BRAND_LEGAL_NAME \
    NEXT_PUBLIC_TRACKING_PREFIX=$NEXT_PUBLIC_TRACKING_PREFIX \
    NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_CONTACT_PHONE=$NEXT_PUBLIC_CONTACT_PHONE \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_CONTACT_STREET=$NEXT_PUBLIC_CONTACT_STREET \
    NEXT_PUBLIC_CONTACT_ZIP=$NEXT_PUBLIC_CONTACT_ZIP \
    NEXT_PUBLIC_CONTACT_CITY=$NEXT_PUBLIC_CONTACT_CITY

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
