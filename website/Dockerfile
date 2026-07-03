# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
# API_URL is resolved at runtime by the rewrite (server-side), but Next bakes
# the value read in next.config.mjs at build time — pass it as a build arg.
ARG API_URL=http://backend:8000
ENV API_URL=$API_URL
RUN yarn build

# Runtime stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S technify && adduser -S technify -G technify

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER technify
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
