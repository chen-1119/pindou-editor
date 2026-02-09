FROM node:22-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM zeabur/caddy-static

# 将构建出的 dist 目录复制到 Caddy 的默认服务目录
COPY --from=build /src/dist /usr/share/caddy

EXPOSE 8080
