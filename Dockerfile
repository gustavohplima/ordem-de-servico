# Stage 1 — Build Angular app
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# Stage 2 — Serve static files with Nginx
FROM nginx:1.27-alpine AS runtime

# Remove default Nginx config and replace with custom
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy Angular browser bundles from build stage
COPY --from=build /app/dist/front-end-services/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://0.0.0.0/ > /dev/null || exit 1
