
// 这是一个“伪装”的 server.js，用来欺骗 Zeabur 启动我们的静态服务
import { execSync } from 'child_process';

console.log('Server.js starting...');
console.log('Attempting to start static file server...');

try {
    // 使用 execSync 执行 serve 命令，接管当前进程
    // 绑定 0.0.0.0:8080 并托管 dist 目录
    execSync('npx serve -s dist -l tcp://0.0.0.0:8080', { stdio: 'inherit' });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
