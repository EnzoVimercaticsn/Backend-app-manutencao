# Backend simples de acompanhamentos

API pública em Node.js, Express e TiDB/MySQL. Não há login, token, JWT, autenticação, autorização ou controle de acesso.

## Instalação

```bash
npm install
```

Execute o conteúdo de `schema.sql` no banco e depois inicie:

```bash
npm start
```

A API usa a porta `4000` por padrão.

## Interface

Depois de iniciar o servidor, abra `http://localhost:4000/`. A tela permite preencher o acompanhamento, anexar imagens e visualizar os registros salvos.

## Rotas públicas

- `GET /health`
- `GET /api/acompanhamentos`
- `GET /api/acompanhamentos/:id`
- `POST /api/acompanhamentos`

O POST usa `multipart/form-data`. Envie `itens` como JSON em texto. Para associar imagens aos itens, use nomes de campo como `item_1`, `item_2` ou `imagem_1`, correspondendo ao `numero_pergunta` do item. As novas imagens são convertidas para Base64 e salvas diretamente no banco nas colunas `dados_base64` e `mime_type`.

Antes do deploy, execute `database-migration-base64.sql` no banco.
