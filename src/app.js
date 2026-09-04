const express = require('express');
const path = require('path');
const acompanhamentoRoutes = require('./routes/acompanhamentoRoutes');

const app = express();
const uploadRoot = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.resolve(process.env.UPLOAD_DIR || 'uploads');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/uploads', express.static(uploadRoot));

app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../public/index.html')));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/acompanhamentos', acompanhamentoRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({ erro: error.message || 'Erro interno do servidor.' });
});

module.exports = app;
