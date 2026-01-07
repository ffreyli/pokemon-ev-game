# build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# production stage
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
