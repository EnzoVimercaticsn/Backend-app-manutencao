const db = require('../db');

async function limparNotificacoesConclusaoExpiradas() {
  const [resultado] = await db.query(`
    UPDATE pendencias
    SET pen_solicitacao_conclusao = NULL,
        pen_prova_conclusao = NULL,
        pen_observacao_conclusao = NULL,
        pen_motivo_reprovacao = NULL,
        pen_solicitada_por = NULL,
        pen_solicitada_em = NULL,
        pen_decidida_em = NULL
    WHERE pen_solicitacao_conclusao IN ('aprovada', 'reprovada')
      AND pen_decidida_em IS NOT NULL
      AND pen_decidida_em <= DATE_SUB(NOW(), INTERVAL 14 DAY)
  `);

  return resultado.affectedRows || 0;
}

module.exports = limparNotificacoesConclusaoExpiradas;