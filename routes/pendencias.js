const express = require('express');
const router = express.Router();
const {
  listarPendencias,
  buscarPendenciaPorId,
  criarPendencia,
  atualizarPendencia,
  deletarPendencia
} = require('../controllers/pendenciasController');

router.get('/', listarPendencias);
router.get('/:id', buscarPendenciaPorId);
router.post('/', criarPendencia);
router.put('/:id', atualizarPendencia);
router.delete('/:id', deletarPendencia);

module.exports = router;
