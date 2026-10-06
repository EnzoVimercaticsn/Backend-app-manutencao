const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const tamanhoChave = 64;

async function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const chave = await scrypt(senha, salt, tamanhoChave);
  return `scrypt$${salt}$${chave.toString('hex')}`;
}

async function compararSenha(senha, armazenada) {
  if (typeof senha !== 'string' || !senha) return false;
  if (!armazenada?.startsWith('scrypt$')) return senha === armazenada;

  const [, salt, hashHex] = armazenada.split('$');
  if (!salt || !hashHex) return false;

  const hash = await scrypt(senha, salt, tamanhoChave);
  const esperado = Buffer.from(hashHex, 'hex');
  return esperado.length === hash.length && crypto.timingSafeEqual(esperado, hash);
}

module.exports = { gerarHashSenha, compararSenha };