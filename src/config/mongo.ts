import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/ozmap"
  const MONGO_DB = process.env.MONGO_DB ?? "ozmap";
  if (!MONGO_URI) throw new Error("MONGO_URI não definido no ambiente");
  if (!MONGO_DB) throw new Error("MONGO_DB não definido no ambiente");

  client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  db = client.db(MONGO_DB);

  return db;
}

export async function getLogsCollection<T = any>(): Promise<Collection<T>> {
  const database = await getDb();
  const LOGS_COLL = process.env.MONGO_LOGS_COLL ?? "logs";
  if (!LOGS_COLL) throw new Error("MONGO_LOGS_COLL não definido no ambiente");
  return database.collection<T>(LOGS_COLL);
}