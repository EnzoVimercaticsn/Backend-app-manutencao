const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  buscarUsuarioPorMatricula,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario
} = require('../controllers/usuariosController');

router.get('/', listarUsuarios);
router.get('/:matricula', buscarUsuarioPorMatricula);
router.post('/', criarUsuario);
router.put('/:matricula', atualizarUsuario);
router.delete('/:matricula', deletarUsuario);

module.exports = router;
