const db = require('../db');
const crypto = require('crypto');
const { promisify } = require('util');
const SENHA_PADRAO = 'AppManutenção';
const TAMANHO_CHAVE = 64;
const scrypt = promisify(crypto.scrypt);

const camposPublicos = 'uso_matric, uso_nome, uso_is_adm, uso_empresa';

async function gerarHash(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const chave = await scrypt(senha, salt, TAMANHO_CHAVE);
  return `scrypt$${salt}$${chave.toString('hex')}`;
}

async function compararSenha(senha, armazenada) {
  if (!armazenada?.startsWith('scrypt$')) return armazenada === senha;
  const [, salt, hashHex] = armazenada.split('$');
  if (!salt || !hashHex) return false;
  const hash = await scrypt(senha, salt, TAMANHO_CHAVE);
  const esperado = Buffer.from(hashHex, 'hex');
  return esperado.length === hash.length && crypto.timingSafeEqual(esperado, hash);
}

exports.listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT ${camposPublicos} FROM usuario ORDER BY uso_matric ASC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
};

exports.buscarUsuarioPorMatricula = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    if (!matricula || matricula === 'undefined' || matricula === 'null') return res.status(400).json({ error: 'Parâmetro "matricula" é obrigatório' });
    const [rows] = await db.query(`SELECT ${camposPublicos} FROM usuario WHERE uso_matric = ?`, [req.params.matricula]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
  }
};

exports.criarUsuario = async (req, res) => {
  try {
    const { uso_matric, uso_nome, uso_is_adm, uso_empresa } = req.body;
    const senhaHash = await gerarHash(SENHA_PADRAO);
    const [result] = await db.query(
      'INSERT INTO usuario (uso_matric, uso_nome, uso_senha, uso_is_adm, uso_empresa) VALUES (?, ?, ?, ?, ?)',
      [uso_matric, uso_nome, senhaHash, uso_is_adm, uso_empresa]
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
    if (!(await compararSenha(senhaAtual, usuarios[0].uso_senha))) return res.status(401).json({ error: 'Senha atual inválida' });
    await db.query('UPDATE usuario SET uso_senha = ? WHERE uso_matric = ?', [await gerarHash(novaSenha), matricula]);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha', details: error.message });
  }
};

exports.redefinirSenha = async (req, res) => {
  try {
    const matricula = req.params.matricula;
    const novaSenha = req.body.novaSenha || SENHA_PADRAO;
    if (!matricula || matricula === 'undefined' || matricula === 'null') return res.status(400).json({ error: 'Parâmetro "matricula" é obrigatório' });
    if (typeof novaSenha !== 'string' || novaSenha.length < 6) return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    const [result] = await db.query('UPDATE usuario SET uso_senha = ? WHERE uso_matric = ?', [await gerarHash(novaSenha), matricula]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao redefinir senha', details: error.message });
  }
};

exports.autenticarUsuario = async (req, res) => {
  try {
    const { matricula, senha } = req.body;
    if (!matricula || typeof senha !== 'string' || !senha) return res.status(400).json({ error: 'Matrícula e senha são obrigatórias' });
    const [usuarios] = await db.query('SELECT * FROM usuario WHERE uso_matric = ?', [matricula]);
    if (!usuarios.length || !(await compararSenha(senha, usuarios[0].uso_senha))) return res.status(401).json({ error: 'Matrícula ou senha inválida' });
    const usuario = usuarios[0];
    if (!usuario.uso_senha?.startsWith('scrypt$')) await db.query('UPDATE usuario SET uso_senha = ? WHERE uso_matric = ?', [await gerarHash(senha), matricula]);
    const { uso_senha, ...usuarioSeguro } = usuario;
    res.json(usuarioSeguro);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao autenticar usuário', details: error.message });
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
