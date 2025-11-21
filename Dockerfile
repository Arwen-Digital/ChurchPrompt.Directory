###
# Multi-stage Dockerfile for Church Prompt Directory (Astro + Node adapter)
# - Builder: installs deps, builds Astro site
# - Runner: installs production deps, copies `dist` and runs the app
###

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
