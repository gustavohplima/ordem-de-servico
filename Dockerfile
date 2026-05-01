FROM node:22-alpine AS build

WORKDIR /app

# Install all deps (including dev) to compile the Angular SSR bundle.
COPY package*.json ./
RUN npm ci

# Copy source and create production build.
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

# Install only runtime dependencies.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled app from build stage.
COPY --from=build /app/dist ./dist

# Use non-root user for better container security.
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
	CMD wget -qO- "http://127.0.0.1:${PORT}/" > /dev/null || exit 1

CMD ["node", "dist/front-end-services/server/server.mjs"]
