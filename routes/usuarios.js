const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  buscarUsuarioPorMatricula,
  criarUsuario,
  atualizarUsuario,
  alterarSenha,
  redefinirSenha,
  autenticarUsuario,
  deletarUsuario
} = require('../controllers/usuariosController');

router.get('/', listarUsuarios);
router.post('/login', autenticarUsuario);
router.get('/:matricula', buscarUsuarioPorMatricula);
router.post('/', criarUsuario);
router.put('/:matricula', atualizarUsuario);
router.put('/:matricula/senha', alterarSenha);
router.put('/:matricula/redefinir-senha', redefinirSenha);
router.delete('/:matricula', deletarUsuario);

module.exports = router;
