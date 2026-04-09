# ЭТАП 1: Сборка (Node.js)
FROM node:20-alpine AS builder
WORKDIR /app
# Кэшируем зависимости
COPY package*.json ./
RUN npm ci
# Копируем код и собираем продакшен статику (Vite)
COPY . .
RUN npm run build

# ЭТАП 2: Раздача (Nginx)
FROM nginx:alpine
# Копируем конфиг сервера
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Очищаем дефолтную страницу Nginx и переносим наш билд
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
