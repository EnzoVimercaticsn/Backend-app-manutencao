const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const requestedPort = Number(process.env.PORT || 3000);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Backend da aplicação de manutenção rodando.',
    endpoints: ['/pendencias', '/prazos', '/usuarios']
  });
});

app.use('/pendencias', require('./routes/pendencias'));
app.use('/prazos', require('./routes/prazos'));
app.use('/usuarios', require('./routes/usuarios'));

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Porta ${port} já está em uso. Tentando ${fallbackPort}...`);
      server.close(() => startServer(fallbackPort));
      return;
    }

    console.error(error);
    process.exit(1);
  });
}

startServer(requestedPort);
