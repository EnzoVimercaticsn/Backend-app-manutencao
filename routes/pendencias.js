const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/admin');
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
router.delete('/:id', requireAdmin, deletarPendencia);

module.exports = router;
