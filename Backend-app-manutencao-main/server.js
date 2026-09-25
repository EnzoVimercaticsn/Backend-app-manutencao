const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./db');

dotenv.config();

const app = express();
const requestedPort = Number(process.env.PORT || 3000);

// Habilita CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.options('*', cors({ origin: corsOrigin }));

// Habilita JSON
app.use(express.json({ limit: '12mb' }));

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Backend da aplicação de manutenção rodando.',
    endpoints: [
      '/pendencias',
      '/prazos',
      '/usuarios',
      '/datas'
    ]
  });
});

// Rotas da aplicação
app.use('/pendencias', require('./routes/pendencias'));
app.use('/prazos', require('./routes/prazos'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/datas', require('./routes/datas'));

// Inicialização do servidor
async function garantirColunasSolicitacao() {
  const [colunas] = await db.query('SHOW COLUMNS FROM pendencias');
  const existentes = new Set(colunas.map(coluna => coluna.Field));
  const novasColunas = {
    pen_solicitacao_conclusao: 'VARCHAR(20) NULL',
    pen_prova_conclusao: 'LONGTEXT NULL',
    pen_solicitada_por: 'INT NULL',
    pen_solicitada_em: 'DATETIME NULL'
  };

  for (const [nome, definicao] of Object.entries(novasColunas)) {
    if (!existentes.has(nome)) {
      await db.query(`ALTER TABLE pendencias ADD COLUMN ${nome} ${definicao}`);
    }
  }
}

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(
        `Porta ${port} já está em uso. Tentando ${fallbackPort}...`
      );

      server.close(() => startServer(fallbackPort));
      return;
    }

    console.error(error);
    process.exit(1);
  });
}

garantirColunasSolicitacao()
  .then(() => startServer(requestedPort))
  .catch(error => {
    console.error('Não foi possível preparar o banco de dados:', error);
    process.exit(1);
  });