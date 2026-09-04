require('dotenv').config();

const app = require('./src/app');
const { pool } = require('./src/database/db');

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`API rodando em http://${host}:${port}`);
});

function encerrar() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
