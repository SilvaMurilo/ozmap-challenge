## OZmap Challenge

Projeto de integração que lê dados de um ISP (mock JSON Server) e sincroniza para um mock de API OZmap (Express), persistindo dados relacionais em MySQL e logs em MongoDB.

### Visão Geral
- **Sincronizador (`src/index.ts`)**: agenda jobs (cron) que buscam entidades do ISP e chamam a API OZmap mock para salvar `boxes`, `prospects` (customers) e `cables`/`drop_cables`.
- **SDK/HTTP (`src/ozSdk.ts`)**: funções HTTP para interagir com a API OZmap mock.
- **Mock OZmap (`mock/server.ts`)**: API Express em `http://localhost:9994/api/v2` (endpoints: `boxes`, `prospects`, `cables`, `logs`).
- **MySQL (`src/config/db.ts`)**: conexão via Kysely; schema em `migration.sql`.
- **MongoDB (`src/config/mongo.ts`)**: armazena logs na coleção configurável.

### Requisitos
- Node.js 18+ e pnpm/npm
- MySQL 8+ com database `ozmap`
- MongoDB 6+

### Instalação
```bash
npm install
```

### Scripts NPM
```bash
# Sobe o mock OZmap (Express) com watch
npm run mock:ozmap

# Inicia o json-server
json-server --watch ./mock/isp.json

# Inicia o sincronizador (cron)
npm run start:tsx

# Testes
npm test
npm run test:watch
```

## Configuração dos Bancos de Dados

Para que a aplicação funcione corretamente, é necessário ter **MySQL** e **MongoDB** em execução e configurados no `.env` (verifique o `env.example` para referência).


### MySQL

1. **Crie a base de dados** `ozmap`.  
2. **Execute a migração** utilizando o arquivo `migration.sql`:  

```bash
# Ajuste os parâmetros conforme o seu ambiente/local
mysql -h 127.0.0.1 -u desafio -pdesafio ozmap < migration.sql
````
---

### MongoDB

1. **Garanta que o servidor MongoDB esteja rodando** (por exemplo, com `mongod` localmente ou via container Docker).
2. **Confira no `.env`** se a URI e o banco configurados existem.
3. **Crie o banco e as coleções** caso necessário.
___


> **Dicas – MySQL**
>
> - Se estiver usando Docker, verifique se o container do MySQL está ativo antes de rodar a migração.
> - Para visualizar e gerenciar o banco de dados, recomenda-se o uso de [DBeaver](https://dbeaver.io/) ou [MySQL Workbench](https://www.mysql.com/products/workbench/).

> **Dicas – MongoDB**
>
> - Garanta que o servidor MongoDB esteja ativo (localmente ou em container).
> - Para visualizar e gerenciar o banco de dados, recomenda-se o uso de [MongoDB Compass](https://www.mongodb.com/try/download/compass) ou [Robo 3T](https://robomongo.org/).





### Mock do ISP (JSON Server)
Por padrão o sincronizador lê do `ISP_BASE_URL` (default `http://localhost:3000`). Para simular um ISP local usando `mock/isp.json` e `mock/routes.json`:
```bash
npx json-server --watch mock/isp.json --port 3000 --routes mock/routes.json
```

### Mock OZmap (API Express)
Endpoints principais (porta 9994):
- `POST /api/v2/boxes`
- `POST /api/v2/prospects`
- `POST /api/v2/cables`
- `POST /api/v2/logs`
- `GET /api/v2/cables/:id?cable_type=FIBER`
- `GET /api/v2/boxes/:id`
- `GET /api/v2/prospects/:id`
- `GET /api/v2/logs?entity=boxes&action=save&page=1&pageSize=50`

Execute:
```bash
npm run mock:ozmap
# Health: GET http://localhost:9994/api/v2/health
```

### Executando a Sincronização
1) Suba o mock OZmap e o ISP (JSON Server).
2) Garanta MySQL migrado e Mongo rodando.
3) Rode o sincronizador:
```bash
ISP_BASE_URL=http://localhost:3000 \
OZMAP_BASE_URL=http://localhost:9994/api/v2 \
npm run start:tsx
```

### Estrutura de Dados
- MySQL: ver `migration.sql` para `boxes`, `prospects`, `cables` (índices e FKs incluídos).
- Mongo: coleção de `logs` configurável via `MONGO_LOGS_COLL`.

### Testes
```bash
npm test
```
Os testes estão em `src/tests/`