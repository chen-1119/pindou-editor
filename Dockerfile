FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g serve
RUN npm run build

# Expose Zeabur defualt port
EXPOSE 8080
# Start the static file server
CMD ["serve", "-s", "dist", "-l", "8080"]
