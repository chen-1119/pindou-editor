import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// 关键：自动使用环境变量 PORT，如果没有则默认 8080
const port = process.env.PORT || 8080;

// 托管 dist 目录下的静态文件
app.use(express.static('dist'));

// 所有其他请求都返回 index.html (SPA 路由支持)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 绑定到 0.0.0.0 以确保外部可访问
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
