## OZmap Challenge

<p align="center">
    <img src="./logo_OZmap.png" alt="demonstration" height="280"/>
</p>

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

Claro, aqui está apenas a seção de configuração dos bancos de dados, já aprimorada e formatada em Markdown.

-----

## Configuração dos Bancos de Dados

A aplicação requer instâncias do **MySQL** e **MongoDB**. Para facilitar a configuração, recomendamos o uso de Docker, mas também fornecemos as instruções para uma configuração manual.

### Opção 1: Usando Docker (Recomendado)

Esta é a forma mais rápida e recomendada para configurar os bancos de dados, pois garante um ambiente padronizado e isolado. Na pasta `/images` do projeto, você encontrará os arquivos `docker-compose` para cada serviço.

1.  **Pré-requisito:** Certifique-se de ter o [Docker](https://www.docker.com/get-started/) e o [Docker Compose](https://docs.docker.com/compose/install/) instalados.

2.  **Inicie os containers**:
    Abra seu terminal na raiz do projeto e execute os seguintes comandos para iniciar cada serviço em background (`-d`):

    ```bash
    # Inicia o container do MySQL
    docker-compose -f images/mysql.yml up -d

    # Inicia o container do MongoDB
    docker-compose -f images/mongo.yml up -d
    ```

    *Você pode verificar se os containers estão em execução com o comando `docker ps`.*

3.  **Execute a migração do MySQL**:
    Com o container do MySQL rodando, execute o script de migração. O `docker-compose` já utiliza as credenciais do `env.example`.

    ```bash
    # Ajuste os parâmetros se você alterou as credenciais padrão
    mysql -h 127.0.0.1 -u desafio -pdesafio ozmap < migration.sql
    ```

> **Dicas de Ferramentas**
>
>   - **MySQL:** Para visualizar e gerenciar o banco de dados, recomenda-se o uso de [DBeaver](https://dbeaver.io/).
>   - **MongoDB:** Para visualizar e gerenciar o banco de dados, recomenda-se o uso de [MongoDB Compass](https://www.mongodb.com/try/download/compass).

---

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