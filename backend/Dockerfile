# Native arm64 on Oracle Ampere A1; also supports amd64. No secrets are build arguments.
FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
ARG MEDUSA_BACKEND_URL
# Build-time validation uses non-secret placeholders and never connects to these endpoints.
RUN test -n "$MEDUSA_BACKEND_URL" && \
    NODE_ENV=production MEDUSA_BACKEND_URL="$MEDUSA_BACKEND_URL" \
    DATABASE_URL=postgresql://baetee_medusa@db.invalid:5432/postgres DATABASE_SCHEMA=medusa \
    DATABASE_SSL=true DATABASE_CA_CERT=/etc/ssl/certs/ca-certificates.crt \
    REDIS_URL=redis://redis:6379 STORE_CORS=https://store.invalid ADMIN_CORS="$MEDUSA_BACKEND_URL" AUTH_CORS="$MEDUSA_BACKEND_URL" \
    JWT_SECRET=6f48033489db31ca3227cb6080a323232bc4fab7151a137095c53e0cb59110bb \
    COOKIE_SECRET=01f40c3e2a0c3e6b64b2f11df52dc883a48fe35953823b90fd35ed66be159e23 \
    S3_FILE_URL=https://storage.invalid S3_ACCESS_KEY_ID=build-only S3_SECRET_ACCESS_KEY=build-only \
    S3_REGION=build-only S3_BUCKET=build-only S3_ENDPOINT=https://storage.invalid npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=9000 XDG_CONFIG_HOME=/tmp/medusa-config
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/.medusa/server/ ./
RUN npm ci --omit=dev && npm cache clean --force && chown node:node /app
USER node
EXPOSE 9000
CMD ["npm", "start"]
