const db = require('../db');
const SENHA_PADRAO = '123456';

exports.listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuario ORDER BY uso_matric ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
};

exports.buscarUsuarioPorMatricula = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    if (!matricula || matricula === 'undefined' || matricula === 'null') return res.status(400).json({ error: 'Parâmetro "matricula" é obrigatório' });
    const [rows] = await db.query('SELECT * FROM usuario WHERE uso_matric = ?', [req.params.matricula]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
  }
};

exports.criarUsuario = async (req, res) => {
  try {
    const { uso_matric, uso_nome, uso_is_adm, uso_empresa } = req.body;
    const [result] = await db.query(
      'INSERT INTO usuario (uso_matric, uso_nome, uso_senha, uso_is_adm, uso_empresa) VALUES (?, ?, ?, ?, ?)',
      [uso_matric, uso_nome, SENHA_PADRAO, uso_is_adm, uso_empresa]
    );
    res.status(201).json({ id: result.insertId, senhaPadrao: SENHA_PADRAO, message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};

exports.atualizarUsuario = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    if (!matricula || matricula === 'undefined' || matricula === 'null') return res.status(400).json({ error: 'Parâmetro "matricula" é obrigatório' });
    const { uso_nome, uso_is_adm, uso_empresa } = req.body;
    await db.query(
      'UPDATE usuario SET uso_nome = ?, uso_is_adm = ?, uso_empresa = ? WHERE uso_matric = ?',
      [uso_nome, uso_is_adm, uso_empresa, req.params.matricula]
    );
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
};

exports.alterarSenha = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    const { senhaAtual, novaSenha } = req.body;
    if (!matricula || matricula === 'undefined' || matricula === 'null') return res.status(400).json({ error: 'Parâmetro "matricula" é obrigatório' });
    if (typeof senhaAtual !== 'string' || !senhaAtual) return res.status(400).json({ error: 'A senha atual é obrigatória' });
    if (typeof novaSenha !== 'string' || novaSenha.length < 6) return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    const [usuarios] = await db.query('SELECT uso_senha FROM usuario WHERE uso_matric = ?', [matricula]);
    if (usuarios.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (usuarios[0].uso_senha !== senhaAtual) return res.status(401).json({ error: 'Senha atual inválida' });
    await db.query('UPDATE usuario SET uso_senha = ? WHERE uso_matric = ?', [novaSenha, matricula]);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha', details: error.message });
  }
};

exports.deletarUsuario = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    if (!matricula || matricula === 'undefined' || matricula === 'null') return res.status(400).json({ error: 'Parâmetro "matricula" é obrigatório' });
    await db.query('DELETE FROM usuario WHERE uso_matric = ?', [req.params.matricula]);
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover usuário', details: error.message });
  }
};
