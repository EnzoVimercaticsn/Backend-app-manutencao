const db = require('../db');

exports.listarPendencias = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pendencias ORDER BY pen_cod DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pendências', details: error.message });
  }
};

exports.buscarPendenciaPorId = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pendencias WHERE pen_cod = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pendência não encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pendência', details: error.message });
  }
};

exports.criarPendencia = async (req, res) => {
  try {
    const { pen_local, pen_data_da_verifi, pen_area, pen_desc, pen_item_con, pen_descumprimento_legis } = req.body;
    const [result] = await db.query(
      'INSERT INTO pendencias (pen_local, pen_data_da_verifi, pen_area, pen_desc, pen_item_con, pen_descumprimento_legis) VALUES (?, ?, ?, ?, ?, ?)',
      [pen_local, pen_data_da_verifi, pen_area, pen_desc, pen_item_con, pen_descumprimento_legis]
    );
    res.status(201).json({ id: result.insertId, message: 'Pendência criada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pendência', details: error.message });
  }
};

exports.atualizarPendencia = async (req, res) => {
  try {
    const { pen_local, pen_data_da_verifi, pen_area, pen_desc, pen_item_con, pen_descumprimento_legis } = req.body;
    await db.query(
      'UPDATE pendencias SET pen_local = ?, pen_data_da_verifi = ?, pen_area = ?, pen_desc = ?, pen_item_con = ?, pen_descumprimento_legis = ? WHERE pen_cod = ?',
      [pen_local, pen_data_da_verifi, pen_area, pen_desc, pen_item_con, pen_descumprimento_legis, req.params.id]
    );
    res.json({ message: 'Pendência atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar pendência', details: error.message });
  }
};

exports.deletarPendencia = async (req, res) => {
  try {
    await db.query('DELETE FROM pendencias WHERE pen_cod = ?', [req.params.id]);
    res.json({ message: 'Pendência removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover pendência', details: error.message });
  }
};
