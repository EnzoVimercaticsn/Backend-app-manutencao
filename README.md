# Backend de Manutenção

API REST em Node.js e Express para gerenciar pendências, prazos, datas e usuários, com persistência em MySQL.

## Requisitos

- Node.js
- MySQL

## Configuração

Instale as dependências e crie um arquivo `.env` na raiz com as credenciais do banco:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=DBpendencias
PORT=3000
CORS_ORIGIN=*
```

Prepare o banco usando `database.sql` e, quando necessário, aplique as migrações SQL disponíveis.

## Execução

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Estrutura

- `routes/`: definição dos endpoints HTTP.
- `controllers/`: lógica das operações da API.
- `middleware/`: validações e controle de acesso.
- `db.js`: pool de conexões MySQL.
