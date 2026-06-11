FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma client for Linux platform
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
