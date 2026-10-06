(() => {
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.header');
    if (!sidebar || !header) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-toggle';
    button.setAttribute('aria-label', 'Abrir menu de navegação');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span></span><span></span><span></span>';

    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.className = 'menu-collapse';
    collapseButton.setAttribute('aria-label', 'Fechar menu lateral');
    collapseButton.setAttribute('aria-expanded', 'true');
    collapseButton.innerHTML = '<span aria-hidden="true">‹</span>';

    header.prepend(button);
    document.body.append(collapseButton);
    document.body.append(overlay);

    sidebar.querySelectorAll('a[href*="/src/html/"]').forEach(link => {
        const url = new URL(link.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        const partes = url.pathname.split('/');
        partes[partes.length - 1] = partes[partes.length - 1].toLowerCase();
        link.href = `${partes.join('/')}${url.search}${url.hash}`;
    });

    const atualizarRecolhimento = recolhido => {
        document.body.classList.toggle('menu-recolhido', recolhido);
        collapseButton.classList.toggle('recolhido', recolhido);
        collapseButton.setAttribute('aria-expanded', String(!recolhido));
        collapseButton.setAttribute('aria-label', recolhido ? 'Abrir menu lateral' : 'Fechar menu lateral');
        collapseButton.querySelector('span').textContent = recolhido ? '›' : '‹';
    };

    const fechar = () => {
        sidebar.classList.remove('menu-aberto');
        overlay.classList.remove('ativo');
        button.classList.remove('ativo');
        document.body.classList.remove('menu-visivel');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Abrir menu de navegação');
        overlay.setAttribute('aria-hidden', 'true');
    };

    const alternar = () => {
        const aberto = sidebar.classList.toggle('menu-aberto');
        overlay.classList.toggle('ativo', aberto);
        button.classList.toggle('ativo', aberto);
        document.body.classList.toggle('menu-visivel', aberto);
        button.setAttribute('aria-expanded', String(aberto));
        button.setAttribute('aria-label', aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
        overlay.setAttribute('aria-hidden', String(!aberto));
    };

    const loginSolicitacoes = JSON.parse(localStorage.getItem('login') || 'null');
    const empresaSolicitacoes = String(loginSolicitacoes?.uso_empresa || '').toLowerCase();
    const listaMenu = sidebar.querySelector('ul');

    if (loginSolicitacoes && !empresaSolicitacoes.includes('csn') && listaMenu) {
        const itemMenu = document.createElement('li');
        const icone = document.createElement('img');
        const linkSolicitacoes = document.createElement('a');
        const contador = document.createElement('span');

        icone.src = '/src/assets/layout-grid.svg';
        icone.alt = '';
        icone.className = 'icon-grid';
        linkSolicitacoes.href = '#minhas-solicitacoes';
        linkSolicitacoes.textContent = 'Notificações';
        contador.className = 'notificacoes-contador';
        contador.setAttribute('aria-live', 'polite');
        contador.hidden = true;
        linkSolicitacoes.append(contador);
        itemMenu.append(icone, linkSolicitacoes);
        listaMenu.insertBefore(itemMenu, listaMenu.children[1] || null);

        const escaparHtml = valor => String(valor ?? '').replace(/[&<>"']/g, caractere => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[caractere]);

        const buscarMinhasSolicitacoes = async () => {
            const resposta = await fetch('https://backend-app-manutencao.vercel.app/pendencias/minhas-solicitacoes', {
                headers: { 'x-user-matricula': String(loginSolicitacoes.uso_matric) }
            });
            if (!resposta.ok) throw new Error('Não foi possível carregar as solicitações.');
            return resposta.json();
        };

        const atualizarContador = async () => {
            try {
                const solicitacoes = await buscarMinhasSolicitacoes();
                const reprovadas = solicitacoes.filter(pendencia => pendencia.pen_solicitacao_conclusao === 'reprovada').length;
                contador.textContent = reprovadas ? String(reprovadas) : '';
                contador.hidden = !reprovadas;
                contador.setAttribute('aria-label', reprovadas ? `${reprovadas} solicitação(ões) reprovada(s)` : 'Nenhuma solicitação reprovada');
            } catch (error) {
                contador.textContent = '';
                contador.hidden = true;
            }
        };

        const abrirMinhasSolicitacoes = async () => {
            try {
                const solicitacoes = await buscarMinhasSolicitacoes();
                if (!solicitacoes.length) {
                    await Swal.fire({ title: 'Minhas solicitações', text: 'Você ainda não tem solicitações de conclusão.', confirmButtonText: 'Fechar' });
                    return;
                }

                const paginas = Object.fromEntries(
                    Array.from({ length: 12 }, (_, indice) => [`RS${indice + 1}`, `rs${indice + 1}.html`])
                );
                const html = solicitacoes.map(pendencia => {
                    const status = pendencia.pen_solicitacao_conclusao;
                    const descricaoStatus = status === 'solicitada' ? 'Em análise' : status === 'reprovada' ? 'Reprovada' : 'Aprovada';
                    const pagina = paginas[String(pendencia.pen_local || '').trim().toUpperCase()] || 'home.html';
                    const destino = `/src/html/${pagina}?search=${encodeURIComponent(pendencia.pen_desc || '')}`;
                    const motivo = status === 'reprovada'
                        ? `<p class="solicitacao-motivo"><strong>Motivo da reprovação</strong><span>${escaparHtml(pendencia.pen_motivo_reprovacao || 'Motivo não informado.')}</span></p>`
                        : '';

                    return `<article class="solicitacao-notificacao solicitacao-notificacao--${status}"><div class="solicitacao-notificacao-cabecalho"><strong>Pendência #${escaparHtml(pendencia.pen_cod)} · ${escaparHtml(pendencia.pen_local)}</strong><span class="solicitacao-status">${descricaoStatus}</span></div><p class="solicitacao-descricao">${escaparHtml(pendencia.pen_desc || 'Sem descrição')}</p>${motivo}<a class="solicitacao-abrir" href="${destino}">Ir para pendência <span aria-hidden="true">→</span></a></article>`;
                }).join('');

                await Swal.fire({
                    title: 'Notificações',
                    html: `<div class="solicitacoes-notificacoes-lista">${html}</div>`,
                    width: '680px',
                    confirmButtonText: 'Fechar',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'solicitacoes-notificacoes-popup',
                        title: 'solicitacoes-notificacoes-titulo',
                        htmlContainer: 'solicitacoes-notificacoes-conteudo',
                        confirmButton: 'solicitacoes-notificacoes-fechar'
                    }
                });
            } catch (error) {
                await Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível carregar suas solicitações.' });
            }
        };

        linkSolicitacoes.addEventListener('click', event => {
            event.preventDefault();
            fechar();
            abrirMinhasSolicitacoes();
        });
        atualizarContador();
    }

    button.addEventListener('click', alternar);
    collapseButton.addEventListener('click', () => atualizarRecolhimento(!document.body.classList.contains('menu-recolhido')));
    overlay.addEventListener('click', fechar);
    sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', fechar));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') fechar();
    });
})();

document.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('.swal2-file') || !input.files?.[0]) return;

    let preview = document.getElementById('prova-preview');
    if (!preview) {
        preview = document.createElement('img');
        preview.id = 'prova-preview';
        preview.alt = 'Pré-visualização da prova';
        preview.style.cssText = 'display:block;width:100%;max-height:220px;object-fit:contain;margin:14px auto 0;border:1px solid #dbe5ef;border-radius:8px;background:#f8fafc;padding:6px;';
        input.insertAdjacentElement('afterend', preview);
    }
    preview.src = URL.createObjectURL(input.files[0]);
});

document.querySelectorAll('.table-wrapper').forEach(wrapper => {
    const topScroll = document.createElement('div');
    const spacer = document.createElement('div');
    topScroll.className = 'table-scroll-top';
    topScroll.setAttribute('aria-label', 'Rolagem horizontal da tabela');
    topScroll.setAttribute('role', 'scrollbar');
    spacer.setAttribute('aria-hidden', 'true');
    topScroll.append(spacer);
    wrapper.parentElement.insertBefore(topScroll, wrapper);

    const ajustarLargura = () => {
        const table = wrapper.querySelector('table');
        spacer.style.width = `${Math.max(wrapper.clientWidth + 1, table?.scrollWidth || wrapper.scrollWidth)}px`;
    };
    topScroll.addEventListener('scroll', () => {
        wrapper.scrollLeft = topScroll.scrollLeft;
    });
    wrapper.addEventListener('scroll', () => {
        topScroll.scrollLeft = wrapper.scrollLeft;
    });
    ajustarLargura();
    if (window.ResizeObserver) new ResizeObserver(ajustarLargura).observe(wrapper);
    new MutationObserver(ajustarLargura).observe(wrapper, { childList: true, subtree: true });
});

window.confirmarExclusaoPendencia = async row => {
    const resultado = await Swal.fire({
        title: 'Apagar pendência?',
        text: 'Essa ação também removerá o prazo relacionado.',
        input: 'password',
        inputLabel: 'Confirme sua senha',
        inputPlaceholder: 'Senha do usuário CSN',
        showCancelButton: true,
        confirmButtonText: 'Apagar',
        cancelButtonText: 'Cancelar',
        inputValidator: senha => senha ? undefined : 'Informe sua senha.'
    });
    if (!resultado.isConfirmed) return;

    const login = JSON.parse(localStorage.getItem('login') || 'null');
    try {
        const resposta = await fetch(`https://backend-app-manutencao.vercel.app/pendencias/${row.dataset.penCod}/excluir-csn`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-user-matricula': String(login?.uso_matric || '')
            },
            body: JSON.stringify({ senha: resultado.value })
        });
        if (!resposta.ok) throw new Error(await resposta.text());
        await Swal.fire({ icon: 'success', title: 'Pendência apagada', timer: 1300, showConfirmButton: false });
        window.location.reload();
    } catch (error) {
        let mensagem = 'Não foi possível apagar a pendência.';
        try { mensagem = JSON.parse(error.message).error || mensagem; } catch (_) {}
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem });
    }
};
