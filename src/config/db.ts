import { Kysely, MysqlDialect } from 'kysely'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
  database: process.env.DB_NAME ?? 'ozmap_challenge',
  connectionLimit: 10,
})

export const db = new Kysely<any>({
  dialect: new MysqlDialect({ pool }),
})