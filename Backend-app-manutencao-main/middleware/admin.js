const db = require('../db');

module.exports = async (req, res, next) => {
  const matricula = req.get('x-admin-matricula');
  if (!matricula) return res.status(403).json({ error: 'Acesso restrito a administradores' });

  try {
    const [usuarios] = await db.query(
      'SELECT uso_is_adm FROM usuario WHERE uso_matric = ?',
      [matricula]
    );
    const isAdmin = usuarios.length > 0 && [true, 1, '1', 'true'].includes(usuarios[0].uso_is_adm);
    if (!isAdmin) return res.status(403).json({ error: 'Acesso restrito a administradores' });
    next();
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível validar o administrador', details: error.message });
  }
};
