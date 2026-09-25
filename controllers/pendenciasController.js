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

exports.listarSolicitacoesConclusao = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, pr.pra_status, pr.pra_prazo, pr.pra_responsavel
      FROM pendencias p
      LEFT JOIN prazos pr ON pr.pra_cod = p.pra_cod
      WHERE p.pen_solicitacao_conclusao = 'solicitada'
      ORDER BY p.pen_solicitada_em ASC, p.pen_cod ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar solicitações de conclusão', details: error.message });
  }
};

exports.solicitarConclusao = async (req, res) => {
  const { imagemBase64 } = req.body;
  if (typeof imagemBase64 !== 'string' || !imagemBase64.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Envie uma imagem válida em base64' });
  }
  if (imagemBase64.length > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'A imagem deve ter no máximo 10 MB' });
  }

  try {
    const [result] = await db.query(
      `UPDATE pendencias
       SET pen_solicitacao_conclusao = 'solicitada',
           pen_prova_conclusao = ?,
           pen_solicitada_por = ?,
           pen_solicitada_em = NOW()
       WHERE pen_cod = ? AND (pen_solicitacao_conclusao IS NULL OR pen_solicitacao_conclusao = 'reprovada')`,
      [imagemBase64, req.usuarioMatricula, req.params.id]
    );
    if (!result.affectedRows) return res.status(409).json({ error: 'Pendência já concluída ou com solicitação em análise' });
    res.json({ message: 'Solicitação de conclusão enviada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao solicitar conclusão', details: error.message });
  }
};

async function decidirConclusao(req, res, aprovar) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      'SELECT pra_cod FROM pendencias WHERE pen_cod = ? AND pen_solicitacao_conclusao = \'solicitada\' FOR UPDATE',
      [req.params.id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Solicitação de conclusão não encontrada' });
    }

    await connection.query(
      `UPDATE pendencias
       SET pen_solicitacao_conclusao = ?, pen_prova_conclusao = NULL
       WHERE pen_cod = ?`,
      [aprovar ? 'aprovada' : 'reprovada', req.params.id]
    );
    if (aprovar) {
      await connection.query('UPDATE prazos SET pra_status = NULL WHERE pra_cod = ?', [rows[0].pra_cod]);
    }
    await connection.commit();
    res.json({ message: aprovar ? 'Conclusão aprovada' : 'Conclusão reprovada' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Erro ao decidir solicitação de conclusão', details: error.message });
  } finally {
    connection.release();
  }
}

exports.aprovarConclusao = (req, res) => decidirConclusao(req, res, true);
exports.reprovarConclusao = (req, res) => decidirConclusao(req, res, false);