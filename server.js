const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const requestedPort = Number(process.env.PORT || 3000);

// Habilita CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.options('*', cors({ origin: corsOrigin }));

// Habilita JSON
app.use(express.json());

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

startServer(requestedPort);