const db = require('../db');

exports.listarDatas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM datas
      ORDER BY dat_cod DESC
    `);

    res.json(rows);

  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar datas',
      details: error.message
    });
  }
};

exports.buscarDataPorId = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM datas WHERE dat_cod = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Data não encontrada'
      });
    }

    res.json(rows[0]);

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao buscar data',
      details: error.message
    });

  }
};

exports.criarData = async (req, res) => {
  try {

    const {
      data_prazo,
      pra_cod,
      dat_vezes_adi
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO datas
      (
        data_prazo,
        pra_cod,
        dat_vezes_adi
      )
      VALUES (?, ?, ?)`,
      [
        data_prazo,
        pra_cod,
        dat_vezes_adi
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Data criada com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao criar data',
      details: error.message
    });

  }
};

exports.atualizarData = async (req, res) => {
  try {

    const {
      data_prazo,
      pra_cod,
      dat_vezes_adi
    } = req.body;

    await db.query(
      `UPDATE datas
       SET
          data_prazo = ?,
          pra_cod = ?,
          dat_vezes_adi = ?
       WHERE dat_cod = ?`,
      [
        data_prazo,
        pra_cod,
        dat_vezes_adi,
        req.params.id
      ]
    );

    res.json({
      message: 'Data atualizada com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao atualizar data',
      details: error.message
    });

  }
};

exports.deletarData = async (req, res) => {
  try {

    await db.query(
      'DELETE FROM datas WHERE dat_cod = ?',
      [req.params.id]
    );

    res.json({
      message: 'Data removida com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao remover data',
      details: error.message
    });

  }
};