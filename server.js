
// 这是一个零依赖的纯 Node.js 静态文件服务器
// 专治各种环境不兼容、依赖丢失、端口错误
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log("Wake up Zeabur! Starting deployment...");

const port = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // 处理 URL，支持 SPA (单页应用)
    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();

    // 如果没有扩展名，可能是前端路由，尝试返回 index.html
    // 但首先检查文件是否存在
    if (!extname || !fs.existsSync(filePath)) {
        if (!extname) {
            // 这是一个路由路径，例如 /about，直接返回 index.html
            filePath = path.join(distPath, 'index.html');
        }
    }

    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                // 404 - 再次尝试返回 index.html (SPA Fallback)
                fs.readFile(path.join(distPath, 'index.html'), (err, indexContent) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error: dist/index.html not found. Did you run "npm run build"?');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(indexContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
    console.log(`Serving static files from: ${distPath}`);
});
