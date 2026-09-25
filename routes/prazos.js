const express = require('express');
const router = express.Router();
const {
  listarPrazos,
  buscarPrazoPorId,
  criarPrazo,
  atualizarPrazo,
  atualizarPrazoComHistorico,
  deletarPrazo
} = require('../controllers/prazosController');

router.get('/', listarPrazos);
router.get('/:id', buscarPrazoPorId);
router.post('/', criarPrazo);
router.put('/:id/com-historico', atualizarPrazoComHistorico);
router.put('/:id', atualizarPrazo);
router.delete('/:id', deletarPrazo);

module.exports = router;
