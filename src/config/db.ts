import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";

const dialect = new MysqlDialect({
  pool: createPool({
    database: "ozmap",
    host: "127.0.0.1",
    user: "desafio",
    password: "desafio",
    port: 3306,
    connectionLimit: 10,
  }),
});

export const db = new Kysely<any>({
  dialect,
});