const db = require('../db');

exports.listarPrazos = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM prazos ORDER BY pra_cod DESC'
    );

    res.json(rows);

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao listar prazos',
      details: error.message
    });

  }
};

exports.buscarPrazoPorId = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM prazos WHERE pra_cod = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Prazo não encontrado'
      });
    }

    res.json(rows[0]);

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao buscar prazo',
      details: error.message
    });

  }
};

exports.criarPrazo = async (req, res) => {
  try {

    const {
      pra_prazo,
      pra_observacao,
      pra_responsavel,
      pra_status,
      pra_vezes_adi
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO prazos
      (
        pra_prazo,
        pra_observacao,
        pra_responsavel,
        pra_status,
        pra_vezes_adi
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        pra_prazo,
        pra_observacao,
        pra_responsavel,
        pra_status,
        pra_vezes_adi ?? 0
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Prazo criado com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao criar prazo',
      details: error.message
    });

  }
};

exports.atualizarPrazo = async (req, res) => {
  try {

    const {
      pra_prazo,
      pra_observacao,
      pra_responsavel,
      pra_status,
      pra_vezes_adi
    } = req.body;

    await db.query(
      `UPDATE prazos
       SET
          pra_prazo = ?,
          pra_observacao = ?,
          pra_responsavel = ?,
          pra_status = ?,
          pra_vezes_adi = ?
       WHERE pra_cod = ?`,
      [
        pra_prazo,
        pra_observacao,
        pra_responsavel,
        pra_status,
        pra_vezes_adi,
        req.params.id
      ]
    );

    res.json({
      message: 'Prazo atualizado com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao atualizar prazo',
      details: error.message
    });

  }
};

exports.deletarPrazo = async (req, res) => {
  try {

    await db.query(
      'DELETE FROM prazos WHERE pra_cod = ?',
      [req.params.id]
    );

    res.json({
      message: 'Prazo removido com sucesso'
    });

  } catch (error) {

    res.status(500).json({
      error: 'Erro ao remover prazo',
      details: error.message
    });

  }
};