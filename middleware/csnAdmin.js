const db = require('../db');
const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

async function buscarUsuario(matricula) {
  if (!matricula) return null;

  const [usuarios] = await db.query(
    'SELECT uso_is_adm, uso_empresa FROM usuario WHERE uso_matric = ?',
    [matricula]
  );

  return usuarios[0] || null;
}

async function senhaValida(senha, armazenada) {
  if (typeof senha !== 'string' || !senha) return false;
  if (!armazenada?.startsWith('scrypt$')) return senha === armazenada;
  const [, salt, hashHex] = armazenada.split('$');
  if (!salt || !hashHex) return false;
  const hash = await scrypt(senha, salt, 64);
  const esperado = Buffer.from(hashHex, 'hex');
  return esperado.length === hash.length && crypto.timingSafeEqual(esperado, hash);
}

exports.requireUsuarioNaoCSN = async (req, res, next) => {
  try {
    const usuario = await buscarUsuario(req.get('x-user-matricula'));
    if (!usuario) return res.status(401).json({ error: 'Usuário não autenticado' });
    if (String(usuario.uso_empresa || '').toLowerCase().includes('csn')) {
      return res.status(403).json({ error: 'Usuários da CSN não precisam solicitar conclusão' });
    }
    req.usuario = usuario;
    req.usuarioMatricula = req.get('x-user-matricula');
    next();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível validar o usuário', details: error.message });
  }
};

exports.requireCsnAdmin = async (req, res, next) => {
  try {
    const usuario = await buscarUsuario(req.get('x-admin-matricula'));
    const empresa = String(usuario?.uso_empresa || '').toLowerCase();
    const isAdmin = [true, 1, '1', 'true'].includes(usuario?.uso_is_adm);
    if (!usuario || !isAdmin || !empresa.includes('csn')) {
      return res.status(403).json({ error: 'Acesso restrito a administradores da CSN' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível validar o administrador da CSN', details: error.message });
  }
};

exports.requireCsnPassword = async (req, res, next) => {
  try {
    const matricula = req.get('x-user-matricula');
    const usuario = matricula ? (await db.query(
      'SELECT uso_empresa, uso_senha FROM usuario WHERE uso_matric = ?',
      [matricula]
    ))[0][0] : null;
    const empresa = String(usuario?.uso_empresa || '').toLowerCase();
    if (!usuario || !empresa.includes('csn') || !(await senhaValida(req.body?.senha, usuario.uso_senha))) {
      return res.status(403).json({ error: 'Matrícula ou senha inválida para esta operação' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível validar a senha', details: error.message });
  }
};