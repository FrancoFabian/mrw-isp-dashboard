# syntax=docker/dockerfile:1

# Base image used by all stages.
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ------------------------------
# deps: install dependencies deterministically based on lockfile
# ------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      echo "Lockfile not found. Commit a lockfile (pnpm-lock.yaml, yarn.lock, or package-lock.json)." && exit 1; \
    fi

# ------------------------------
# builder: build Next.js standalone output
# ------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm run build; \
    elif [ -f yarn.lock ]; then \
      yarn build; \
    elif [ -f package-lock.json ]; then \
      npm run build; \
    else \
      echo "Lockfile not found. Commit a lockfile (pnpm-lock.yaml, yarn.lock, or package-lock.json)." && exit 1; \
    fi

# ------------------------------
# runner: minimal runtime with non-root user
# ------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone server and required static assets.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Standalone output includes server.js at the root.
CMD ["node", "server.js"]
