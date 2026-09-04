const express = require('express');
const router = express.Router();
const {
  listarPrazos,
  buscarPrazoPorId,
  criarPrazo,
  atualizarPrazo,
  deletarPrazo
} = require('../controllers/prazosController');

router.get('/', listarPrazos);
router.get('/:id', buscarPrazoPorId);
router.post('/', criarPrazo);
router.put('/:id', atualizarPrazo);
router.delete('/:id', deletarPrazo);

module.exports = router;
