function renderizarFeedbackConclusao(pendencia, prazo) {
    if (pendencia.pen_solicitacao_conclusao === "aprovada") {
        return '<span class="btn-concluir" role="status">Conclusão aprovada</span>';
    }

    if (pendencia.pen_solicitacao_conclusao !== "reprovada") {
        return "";
    }

    const botaoReenviar = prazo && prazo.pra_status !== null
        ? `<button class="btn-concluir" type="button" onclick="solicitarConclusao(${pendencia.pen_cod})">Enviar novamente</button>`
        : "";

    return botaoReenviar;
}