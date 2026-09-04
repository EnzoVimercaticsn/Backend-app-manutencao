const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  buscarUsuarioPorMatricula,
  criarUsuario,
  atualizarUsuario,
  alterarSenha,
  deletarUsuario
} = require('../controllers/usuariosController');

router.get('/', listarUsuarios);
router.get('/:matricula', buscarUsuarioPorMatricula);
router.post('/', criarUsuario);
router.put('/:matricula', atualizarUsuario);
router.put('/:matricula/senha', alterarSenha);
router.delete('/:matricula', deletarUsuario);

module.exports = router;
