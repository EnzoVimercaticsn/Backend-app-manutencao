const { pool } = require('../database/db');

function lerItens(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor !== 'string') return null;
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

function validarItens(itens) {
  return Array.isArray(itens) && itens.length > 0 && itens.every((item) => (
    Number.isInteger(Number(item.numero_pergunta)) &&
    item.titulo &&
    ['C', 'NC'].includes(item.status)
  ));
}

async function criarAcompanhamento(dados, arquivos) {
  const itens = lerItens(dados.itens);
  if (!dados.restaurante || !dados.data_visita || !dados.hora_visita || !dados.servico || !dados.verificado_csn || !validarItens(itens)) {
    const erro = new Error('Envie os campos obrigatorios e itens como uma lista JSON valida.');
    erro.statusCode = 400;
    throw erro;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [acompanhamento] = await connection.execute(
      `INSERT INTO acompanhamento
       (restaurante, data_visita, hora_visita, servico, verificado_csn, validado_sodexo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dados.restaurante, dados.data_visita, dados.hora_visita, dados.servico, dados.verificado_csn, dados.validado_sodexo || null]
    );

    for (const item of itens) {
      const [itemCriado] = await connection.execute(
        `INSERT INTO acompanhamento_item
         (acompanhamento_id, numero_pergunta, titulo, status, descricao)
         VALUES (?, ?, ?, ?, ?)`,
        [acompanhamento.insertId, item.numero_pergunta, item.titulo, item.status, item.descricao || null]
      );

      const arquivosDoItem = arquivos.filter((arquivo) => {
        const match = arquivo.fieldname.match(/(?:item|imagem|imagens)[_-]?(\d+)/i);
        return match && Number(match[1]) === Number(item.numero_pergunta);
      });

      for (const arquivo of arquivosDoItem) {
        const dadosBase64 = `data:${arquivo.mimetype};base64,${arquivo.buffer.toString('base64')}`;
        await connection.execute(
          `INSERT INTO acompanhamento_imagem (item_id, nome_arquivo, caminho_arquivo, dados_base64, mime_type)
           VALUES (?, ?, '', ?, ?)`,
          [itemCriado.insertId, arquivo.originalname, dadosBase64, arquivo.mimetype]
        );
      }
    }

    await connection.commit();
    return acompanhamento.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listarAcompanhamentos() {
  const [rows] = await pool.execute(
    `SELECT a.id, a.restaurante, a.data_visita, a.hora_visita, a.servico,
            a.verificado_csn, a.validado_sodexo, a.criado_em,
            i.id AS item_id, i.numero_pergunta, i.titulo, i.status, i.descricao,
            im.id AS imagem_id, im.nome_arquivo, im.caminho_arquivo, im.dados_base64, im.mime_type
       FROM acompanhamento a
       LEFT JOIN acompanhamento_item i ON i.acompanhamento_id = a.id
       LEFT JOIN acompanhamento_imagem im ON im.item_id = i.id
      ORDER BY a.data_visita DESC, a.hora_visita DESC, a.id DESC, i.numero_pergunta ASC`
  );
  return organizarResultados(rows);
}

async function buscarAcompanhamento(id) {
  const [rows] = await pool.execute(
    `SELECT a.id, a.restaurante, a.data_visita, a.hora_visita, a.servico,
            a.verificado_csn, a.validado_sodexo, a.criado_em,
            i.id AS item_id, i.numero_pergunta, i.titulo, i.status, i.descricao,
            im.id AS imagem_id, im.nome_arquivo, im.caminho_arquivo, im.dados_base64, im.mime_type
       FROM acompanhamento a
       LEFT JOIN acompanhamento_item i ON i.acompanhamento_id = a.id
       LEFT JOIN acompanhamento_imagem im ON im.item_id = i.id
      WHERE a.id = ?
      ORDER BY i.numero_pergunta ASC`,
    [id]
  );
  return organizarResultados(rows)[0] || null;
}

function organizarResultados(rows) {
  const acompanhamentos = new Map();
  for (const row of rows) {
    if (!acompanhamentos.has(row.id)) {
      acompanhamentos.set(row.id, {
        id: row.id,
        restaurante: row.restaurante,
        data_visita: row.data_visita,
        hora_visita: row.hora_visita,
        servico: row.servico,
        verificado_csn: row.verificado_csn,
        validado_sodexo: row.validado_sodexo,
        criado_em: row.criado_em,
        itens: []
      });
    }
    const acompanhamento = acompanhamentos.get(row.id);
    let item = acompanhamento.itens.find((atual) => atual.id === row.item_id);
    if (row.item_id && !item) {
      item = { id: row.item_id, numero_pergunta: row.numero_pergunta, titulo: row.titulo, status: row.status, descricao: row.descricao, imagens: [] };
      acompanhamento.itens.push(item);
    }
    if (item && row.imagem_id) {
      item.imagens.push({
        id: row.imagem_id,
        nome_arquivo: row.nome_arquivo,
        caminho_arquivo: row.caminho_arquivo,
        dados_base64: row.dados_base64,
        mime_type: row.mime_type
      });
    }
  }
  return [...acompanhamentos.values()];
}

module.exports = { criarAcompanhamento, listarAcompanhamentos, buscarAcompanhamento };
