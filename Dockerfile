# syntax=docker/dockerfile:1.7
# Multi-stage build for Next.js standalone output on Cloud Run.

# ---- Base: dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
# System deps some native modules need
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --include=dev

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client against the Postgres schema
RUN npx prisma generate
# DATABASE_URL is intentionally unset at build time — Next.js should not hit the DB during `next build`.
# Any pages that call prisma at build time will fail here; use `export const dynamic = "force-dynamic"` on those routes.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Prisma generated client lives outside .next — copy it so runtime can load it
COPY --from=builder --chown=nextjs:nodejs /app/app/generated ./app/generated
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# prisma.config.ts + dotenv aren't needed at runtime (DATABASE_URL comes from env)

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
