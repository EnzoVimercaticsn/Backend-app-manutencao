const db = require('../db');

exports.listarPendencias = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM pendencias
      ORDER BY pen_cod DESC
    `);

    res.json(rows);

  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar pendências',
      details: error.message
    });
  }
};

exports.buscarPendenciaPorId = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM pendencias WHERE pen_cod = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Pendência não encontrada'
      });
    }

    res.json(rows[0]);

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao buscar pendência',
      details: error.message
    });

  }
};

exports.criarPendencia = async (req, res) => {
  try {

    const {
      pen_local,
      pen_data_inicial,
      pen_data_da_verifi,
      pen_area,
      pen_desc,
      pen_item_con,
      pen_descumprimento_legis,
      pra_cod
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO pendencias
      (
        pen_local,
        pen_data_inicial,
        pen_data_da_verifi,
        pen_area,
        pen_desc,
        pen_item_con,
        pen_descumprimento_legis,
        pra_cod
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pen_local,
        pen_data_inicial,
        pen_data_da_verifi,
        pen_area,
        pen_desc,
        pen_item_con,
        pen_descumprimento_legis,
        pra_cod
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Pendência criada com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao criar pendência',
      details: error.message
    });

  }
};

exports.atualizarPendencia = async (req, res) => {
  try {

    const {
      pen_local,
      pen_data_inicial,
      pen_data_da_verifi,
      pen_area,
      pen_desc,
      pen_item_con,
      pen_descumprimento_legis,
      pra_cod
    } = req.body;

    await db.query(
      `UPDATE pendencias
       SET
          pen_local = ?,
          pen_data_inicial = ?,
          pen_data_da_verifi = ?,
          pen_area = ?,
          pen_desc = ?,
          pen_item_con = ?,
          pen_descumprimento_legis = ?,
          pra_cod = ?
       WHERE pen_cod = ?`,
      [
        pen_local,
        pen_data_inicial,
        pen_data_da_verifi,
        pen_area,
        pen_desc,
        pen_item_con,
        pen_descumprimento_legis,
        pra_cod,
        req.params.id
      ]
    );

    res.json({
      message: 'Pendência atualizada com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao atualizar pendência',
      details: error.message
    });

  }
};

exports.deletarPendencia = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [pendencias] = await connection.query(
      'SELECT pra_cod FROM pendencias WHERE pen_cod = ? FOR UPDATE',
      [req.params.id]
    );

    if (pendencias.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pendência não encontrada' });
    }

    await connection.query('DELETE FROM pendencias WHERE pen_cod = ?', [req.params.id]);

    const prazoId = pendencias[0].pra_cod;
    if (prazoId !== null && prazoId !== undefined) {
      await connection.query('DELETE FROM prazos WHERE pra_cod = ?', [prazoId]);
    }

    await connection.commit();

    res.json({
      message: 'Pendência e prazo removidos com sucesso'
    });

  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      error: 'Erro ao remover pendência',
      details: error.message
    });

  } finally {
    connection.release();

  }
};