# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段 (使用 serve 静态服务)
FROM node:18-alpine

WORKDIR /app
# 全局安装 serve
RUN npm install -g serve

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 8080

# 启动命令 (强制监听 8080)
CMD ["serve", "-s", "dist", "-l", "8080"]
