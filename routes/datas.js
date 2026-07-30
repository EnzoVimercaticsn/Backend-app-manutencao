const express = require('express');
const router = express.Router();

const {
  listarDatas,
  buscarDataPorId,
  criarData,
  atualizarData,
  deletarData
} = require('../controllers/datasController');

router.get('/', listarDatas);
router.get('/:id', buscarDataPorId);
router.post('/', criarData);
router.put('/:id', atualizarData);
router.delete('/:id', deletarData);

module.exports = router;