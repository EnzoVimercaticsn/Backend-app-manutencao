const service = require('../services/acompanhamentoService');

async function criar(req, res, next) {
  try {
    const id = await service.criarAcompanhamento(req.body, req.files || []);
    res.status(201).json({ sucesso: true, id });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    res.json(await service.listarAcompanhamentos());
  } catch (error) {
    next(error);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const acompanhamento = await service.buscarAcompanhamento(req.params.id);
    if (!acompanhamento) return res.status(404).json({ erro: 'Acompanhamento nao encontrado.' });
    res.json(acompanhamento);
  } catch (error) {
    next(error);
  }
}

module.exports = { criar, listar, buscarPorId };
