const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/admin');
const { requireUsuarioNaoCSN, requireCsnAdmin, requireCsnPassword } = require('../middleware/csnAdmin');
const {
  listarPendencias,
  buscarPendenciaPorId,
  criarPendencia,
  atualizarPendencia,
  registrarDataInicial,
  deletarPendencia
  , listarSolicitacoesConclusao
  , solicitarConclusao
  , aprovarConclusao
  , reprovarConclusao
} = require('../controllers/pendenciasController');

router.get('/', listarPendencias);
router.get('/solicitacoes-conclusao', requireCsnAdmin, listarSolicitacoesConclusao);
router.get('/:id', buscarPendenciaPorId);
router.post('/', criarPendencia);
router.put('/:id', atualizarPendencia);
router.patch('/:id/data-inicial', registrarDataInicial);
router.delete('/:id', requireAdmin, deletarPendencia);
router.delete('/:id/excluir-csn', requireCsnPassword, deletarPendencia);
router.post('/:id/solicitar-conclusao', requireUsuarioNaoCSN, solicitarConclusao);
router.post('/:id/aprovar-conclusao', requireCsnAdmin, aprovarConclusao);
router.post('/:id/reprovar-conclusao', requireCsnAdmin, reprovarConclusao);

module.exports = router;
