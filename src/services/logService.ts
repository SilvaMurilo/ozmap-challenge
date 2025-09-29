import {
  getLogsByEntityAction,
  insertLog,
} from "../repositories/logRepository";
import {
  logDocSchema,
  logEntity,
  logAction,
  type LogDoc
} from "../schemas/ozmapSchema";
import { z } from "zod";

export async function createLogService(raw: unknown) {
  const doc = logDocSchema.parse(raw);
  const inserted = await insertLog(doc);
  return inserted;
}

export async function getLogsByEntityActionService(
  entityValue: z.infer<typeof logEntity>,
  actionValue: z.infer<typeof logAction>,
  opts?: { page?: number; pageSize?: number }
): Promise<LogDoc[]> {
  return getLogsByEntityAction(entityValue, actionValue, opts);
}
