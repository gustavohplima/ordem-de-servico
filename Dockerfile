# Stage 1 — Build Angular app
FROM node:24 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# No seu Dockerfile, antes de copiar o app.conf:
RUN rm /etc/nginx/conf.d/default.conf
COPY app.conf /etc/nginx/conf.d/app.conf



COPY . .
RUN npm install
RUN npx ng build --configuration production

FROM nginx:1.27-alpine AS runtime

# Copy Angular browser bundles from build stage
COPY --from=build /app/dist/front-end-services/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
