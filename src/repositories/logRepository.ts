import { WithId } from "mongodb";
import { getLogsCollection } from "../config/mongo";
import { LogAction, LogEntity, type LogDoc } from "../schemas/ozmapSchema";


export async function insertLog(doc: LogDoc): Promise<WithId<LogDoc>> {
  const coll = await getLogsCollection<LogDoc>();
  const res = await coll.insertOne(doc);
  
  return { _id: res.insertedId, ...doc };
}

export async function getLogsByEntityAction(
  entityValue: LogEntity,
  actionValue: LogAction,
  opts?: { page?: number; pageSize?: number }
): Promise<WithId<LogDoc>[]> {
  const coll = await getLogsCollection<LogDoc>();

  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.min(500, Math.max(1, opts?.pageSize ?? 100));
  const skip = (page - 1) * pageSize;

  return coll
    .find({ entity: entityValue, action: actionValue }) // 👈 aqui é o ajuste
    .sort({ ts: -1, _id: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}
