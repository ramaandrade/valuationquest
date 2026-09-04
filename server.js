// ValuationQuest - Servidor HTTP Local Estático (Zero Dependências)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3355;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function createServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/' || reqUrl === '') {
      reqUrl = '/index.html';
    }

    const safePath = path.normalize(reqUrl).replace(/^(\\.\\.[\\/\\])+/, '');
    const filePath = path.join(BASE_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Não Encontrado</h1><p>O arquivo requisitado (' + reqUrl + ') não foi encontrado no ValuationQuest.</p>');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
  });
}

function listen(port) {
  const srv = createServer();
  srv.listen(port, () => {
    console.log('================================================================');
    console.log('  📈 ValuationQuest: A Jornada do Gestor');
    console.log('  🌐 Servidor local ativo em: http://localhost:' + port);
    console.log('  📂 Diretório raiz: ' + BASE_DIR);
    console.log('  Pressione Ctrl+C para encerrar o servidor');
    console.log('================================================================');
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('⚠️  Porta ' + port + ' ocupada, tentando ' + (port + 1) + '...');
      listen(port + 1);
    } else {
      console.error('Erro no servidor:', err);
    }
  });
  return srv;
}

if (require.main === module) {
  listen(PORT);
}

module.exports = { createServer, listen, PORT };
