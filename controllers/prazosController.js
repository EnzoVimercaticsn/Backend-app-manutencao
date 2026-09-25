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
      pra_vezes_adi,
      pra_concluido_em
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO prazos
      (
        pra_prazo,
        pra_observacao,
        pra_responsavel,
        pra_status,
        pra_vezes_adi,
        pra_concluido_em
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pra_prazo,
        pra_observacao,
        pra_responsavel,
        pra_status,
        pra_vezes_adi ?? 0,
        pra_status === null ? (pra_concluido_em || new Date()) : null
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
          pra_vezes_adi = ?,
          pra_concluido_em = CASE WHEN ? IS NULL THEN COALESCE(pra_concluido_em, NOW()) ELSE NULL END
       WHERE pra_cod = ?`,
      [
        pra_prazo,
        pra_observacao,
        pra_responsavel,
        pra_status,
        pra_vezes_adi,
        pra_status,
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

exports.atualizarPrazoComHistorico = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const prazoId = Number(req.params.id);
    const pendenciaId = Number(req.body.pen_cod);
    const {
      pra_prazo,
      pra_observacao,
      pra_responsavel,
      pra_status,
      pra_vezes_adi,
      dat_alterado_por
    } = req.body;

    if (!Number.isSafeInteger(prazoId) || !Number.isSafeInteger(pendenciaId) || !pra_prazo) {
      return res.status(400).json({ error: 'Prazo, pendência e nova data são obrigatórios' });
    }

    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT pr.pra_prazo, pe.pen_data_inicial
       FROM prazos pr
       JOIN pendencias pe ON pe.pra_cod = pr.pra_cod
       WHERE pr.pra_cod = ? AND pe.pen_cod = ?
       FOR UPDATE`,
      [prazoId, pendenciaId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Prazo ou pendência não encontrado' });
    }

    const prazoAnterior = rows[0].pra_prazo;
    const dataAnterior = prazoAnterior instanceof Date
      ? prazoAnterior.toISOString().slice(0, 10)
      : String(prazoAnterior || '').slice(0, 10);
    const anoAnterior = Number(dataAnterior.slice(0, 4));
    let dataInicialAtualizada = false;

    if (anoAnterior > 1900) {
      const [resultadoDataInicial] = await connection.query(
        `UPDATE pendencias
         SET pen_data_inicial = ?
         WHERE pen_cod = ?
           AND (pen_data_inicial IS NULL OR YEAR(pen_data_inicial) <= 1900)`,
        [dataAnterior, pendenciaId]
      );
      dataInicialAtualizada = resultadoDataInicial.affectedRows > 0;
    }

    await connection.query(
      `UPDATE prazos
       SET pra_prazo = ?, pra_observacao = ?, pra_responsavel = ?,
           pra_status = ?, pra_vezes_adi = ?,
           pra_concluido_em = CASE WHEN ? IS NULL THEN COALESCE(pra_concluido_em, NOW()) ELSE NULL END
       WHERE pra_cod = ?`,
      [pra_prazo, pra_observacao, pra_responsavel, pra_status, pra_vezes_adi, pra_status, prazoId]
    );

    await connection.query(
      `INSERT INTO datas (data_prazo, pra_cod, dat_vezes_adi, dat_alterado_por)
       VALUES (?, ?, ?, ?)`,
      [pra_prazo, prazoId, pra_vezes_adi, dat_alterado_por || null]
    );

    await connection.commit();
    res.json({
      message: 'Prazo atualizado e histórico salvo',
      dataInicialAtualizada,
      dataInicial: dataInicialAtualizada ? dataAnterior : rows[0].pen_data_inicial
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao atualizar prazo e histórico', details: error.message });
  } finally {
    connection.release();
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