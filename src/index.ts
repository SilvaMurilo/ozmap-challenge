import axios from "axios";
import axiosRetry from "axios-retry";
import Bottleneck from "bottleneck";
import cron from "node-cron";
import crypto from "node:crypto";
import { createBox, createCable, createProspect, logger } from "./ozSdk";

type EntityName = "cables" | "drop_cables" | "boxes" | "customers";
const PRIORITY: EntityName[] = ["boxes", "customers", "cables", "drop_cables"];

const CONFIG = {
  ISP_BASE_URL: process.env.ISP_BASE_URL ?? "http://localhost:3000",
  RATE_LIMIT_PER_MINUTE: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 50),
  CRON: process.env.CRON ?? "*/30 * * * * *", // a cada 30s
  PAGE_SIZE: Number(process.env.PAGE_SIZE ?? 200),
  TIMEOUT_MS: Number(process.env.TIMEOUT_MS ?? 10_000),
  MAX_RETRIES: Number(process.env.MAX_RETRIES ?? 5),
  ENABLE_INCREMENTAL: (process.env.ENABLE_INCREMENTAL ?? "true") === "true",
  SINGLE_ENTITY: (process.env.SINGLE_ENTITY as EntityName | undefined) ?? undefined,
  SINGLE_ID: process.env.SINGLE_ID ? Number(process.env.SINGLE_ID) : undefined,
};

const entityState: Record<EntityName, { lastSyncAt: string | null; lastId: number | null }> = {
  cables: { lastSyncAt: null, lastId: null },
  drop_cables: { lastSyncAt: null, lastId: null },
  boxes: { lastSyncAt: null, lastId: null },
  customers: { lastSyncAt: null, lastId: null },
};

const http = axios.create({ baseURL: CONFIG.ISP_BASE_URL, timeout: CONFIG.TIMEOUT_MS });
axiosRetry(http, {
  retries: CONFIG.MAX_RETRIES,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    axiosRetry.isNetworkError(err) ||
    axiosRetry.isRetryableError(err) ||
    [408, 429, 500, 502, 503, 504].includes(err.response?.status ?? 0),
});

const limiter = new Bottleneck({
  minTime: Math.ceil(60_000 / CONFIG.RATE_LIMIT_PER_MINUTE),
  reservoir: CONFIG.RATE_LIMIT_PER_MINUTE,
  reservoirRefreshInterval: 60_000,
  reservoirRefreshAmount: CONFIG.RATE_LIMIT_PER_MINUTE,
});

type JsonServerItem = { id: string | number; updated_at?: string; [k: string]: unknown };

async function saveToDb(entity: EntityName, item: any): Promise<void> {
  const entityMap: Record<EntityName, string> = {
    cables: "cables",
    drop_cables: "cables",
    boxes: "boxes",
    customers: "prospects",
  };

  const mappedEntity = entityMap[entity];
  if (mappedEntity === "boxes") {
    await createBox(item);
    console.log(`[saveToDb] Processed box id=${item?.id}`);
  } else if (mappedEntity === "prospects") {
    await createProspect(item);
    console.log(`[saveToDb] Inserted prospect (customer) id=${item?.id}`);
  } else if (mappedEntity === "cables") {
    await createCable(item);
    console.log(`[saveToDb] Processed cable/drop_cable id=${item?.id}`);
  } else {
    console.log(`[saveToDb] Processed ${entity} id=${item?.id}`);
  }
}

async function fetchOneById(entity: EntityName, id: string | number): Promise<JsonServerItem | null> {
  try {
    return await limiter.schedule(() =>
      http.get<JsonServerItem>(`/${entity}/${id}`).then((r) => r.data)
    );
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

async function listIds(entity: EntityName): Promise<Array<string | number>> {
  if (!CONFIG.ENABLE_INCREMENTAL) return await listIdsWithFilter(entity, {});
  const { lastSyncAt, lastId } = entityState[entity];

  const byIdFilter: Record<string, any> = {};
  if (typeof lastId === "number") byIdFilter["id_gt"] = lastId;

  const newIds = await listIdsWithFilter(entity, byIdFilter);
  let changedIds: Array<string | number> = [];
  if (lastSyncAt) changedIds = await listIdsWithFilter(entity, { updated_at_gte: lastSyncAt });

  const set = new Set<string | number>([...newIds, ...changedIds]);

  if (!lastSyncAt && lastId == null) {
    const all = await listIdsWithFilter(entity, {});
    for (const id of all) set.add(id);
  }

  const idsArray = Array.from(set);
  const numeric = idsArray.every((x) => typeof x === "number");
  return numeric ? (idsArray as number[]).sort((a, b) => a - b) : idsArray;
}

async function listIdsWithFilter(entity: EntityName, extraParams: Record<string, any>): Promise<Array<string | number>> {
  const ids: Array<string | number> = [];
  const pageSize = CONFIG.PAGE_SIZE;
  let page = 1;
  while (true) {
    const params = { _limit: pageSize, _page: page, _sort: "id", _order: "asc", ...extraParams };
    const data = await limiter.schedule(() =>
      http.get<JsonServerItem[]>(`/${entity}`, { params }).then((r) => r.data)
    );
    for (const it of data) ids.push(it.id);
    if (data.length < pageSize) break;
    page += 1;
  }
  return ids;
}

function updateEntityStateAfterProcessing(entity: EntityName, processedIds: Array<string | number>, startedAtIso: string) {
  const numericIds = processedIds.filter((x): x is number => typeof x === "number");
  const maxId = numericIds.length ? Math.max(...numericIds) : entityState[entity].lastId;
  entityState[entity].lastId = typeof maxId === "number" ? maxId : entityState[entity].lastId;
  entityState[entity].lastSyncAt = startedAtIso;
}

async function processEntity(entity: EntityName, startedAtIso: string, syncId?: string) {
  if (CONFIG.SINGLE_ENTITY === entity && CONFIG.SINGLE_ID !== undefined) {
    const item = await fetchOneById(entity, CONFIG.SINGLE_ID);
    if (!item) {
      await logger({ level: "warn", message: "item not found (404)", entity, action: "fetch", itemId: CONFIG.SINGLE_ID, syncId });
      console.log(`[entity ${entity}] id=${CONFIG.SINGLE_ID} não encontrado`);
      return;
    }
    await saveToDb(entity, item);
    await logger({ level: "info", message: "item saved", entity, action: "save", itemId: CONFIG.SINGLE_ID, syncId });
    console.log(`[entity ${entity}] OK id=${CONFIG.SINGLE_ID}`);
    updateEntityStateAfterProcessing(entity, [CONFIG.SINGLE_ID], startedAtIso);
    return;
  }

  const ids = await listIds(entity);
  if (ids.length === 0) {
    await logger({ level: "info", message: "no items to process", entity, action: "fetch", syncId });
    console.log(`[entity ${entity}] sem itens para processar`);
    return;
  }

  const processed: Array<string | number> = [];
  for (const id of ids) {
    try {
      const item = await fetchOneById(entity, id);
      if (!item) {
        await logger({ level: "warn", message: "item not found (404)", entity, action: "fetch", itemId: id, syncId });
        console.log(`[entity ${entity}] id=${id} 404`);
        continue;
      }

      await logger({ level: "info", message: "item fetched", entity, action: "fetch", itemId: id, syncId });
      await saveToDb(entity, item);
      await logger({ level: "info", message: "item saved", entity, action: "save", itemId: id, syncId });

      processed.push(id);
      console.log(`[entity ${entity}] OK id=${id}`);
    } catch (e: any) {
      console.error(`[entity ${entity}] erro id=${id}:`, e?.message ?? e);
      await logger({
        level: "error",
        message: `item error: ${e?.message ?? String(e)}`,
        entity,
        action: "other",
        itemId: id,
        syncId,
      });
    }
  }
  updateEntityStateAfterProcessing(entity, processed, startedAtIso);
}


async function runSync() {
  const syncId = crypto.randomUUID();
  const startedAtIso = new Date().toISOString();
  const t0 = Date.now();
  console.log(`[sync ${syncId}] start ${startedAtIso}`);
  await logger({ level: "info", message: "sync start", syncId, payload: { startedAtIso } });

  try {
    const worklist: EntityName[] = CONFIG.SINGLE_ENTITY != null ? [CONFIG.SINGLE_ENTITY] : PRIORITY;

    for (const entity of worklist) {
      try {
        await logger({ level: "info", message: "process entity start", entity, action: "fetch", syncId });
        await processEntity(entity, startedAtIso, syncId);
        await logger({ level: "info", message: "process entity done", entity, action: "other", syncId });
      } catch (e: any) {
        console.error(`[sync ${syncId}] erro em ${entity}:`, e?.message ?? e);
        await logger({ level: "error", message: `entity error: ${e?.message ?? String(e)}`, entity, action: "other", syncId });
      }
    }

    const dur = Date.now() - t0;
    console.log(`[sync ${syncId}] ok em ${dur}ms`);
    await logger({ level: "info", message: "sync ok", syncId, payload: { durationMs: dur } });
  } catch (e: any) {
    console.error(`[sync ${syncId}] FAILED:`, e?.message ?? e);
    await logger({ level: "error", message: `sync failed: ${e?.message ?? String(e)}`, syncId });
  }
}

cron.schedule(CONFIG.CRON, () => {
  const jitterMs = Math.floor(Math.random() * 20_000);
  setTimeout(() => void runSync(), jitterMs);
});
void runSync();

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
async function shutdown(sig: string) {
  console.log(`[shutdown] ${sig}`);
  await limiter.stop({ dropWaitingJobs: true });
  process.exit(0);
}
