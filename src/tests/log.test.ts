import { expect, it } from "vitest";
import {
  createLogService,
  getLogsByEntityActionService,
} from "../services/logService";
import { type LogDoc } from "../schemas/ozmapSchema";
import { createLog, getLogs } from "../ozSdk";
import { insertLog } from "../repositories/logRepository";

it("Should create a log", async () => {
  const now = String(new Date());
  const dto = {
    ts: now,
    level: "info" as const,
    syncId: "d7645fba-8255-437d-9299-2009e4fe5542",
    entity: "boxes" as const,
    action: "save" as const,
    itemId: "123",
    message: "Box salva com sucesso",
    payload: { durationMs: 42 },
    createdAt: now,
  };

  const created = await createLog(dto);
  expect(created).toBeDefined();
  expect(created._id).toBeDefined();
  expect(created.entity).toBe("boxes");
  expect(created.action).toBe("save");
  expect(created.message).toBe("Box salva com sucesso");
}, 25000);

it("Should get action logs", async () => {
  const now = String(new Date());
  const dto = {
    ts: now,
    level: "info" as const,
    syncId: "d7645fba-8255-437d-9299-2009e4fe5542",
    entity: "boxes" as const,
    action: "save" as const,
    itemId: "123",
    message: "Box salva com sucesso",
    payload: { durationMs: 42 },
    createdAt: now,
  };
  const created = await createLog(dto);
  const found = await getLogs("boxes", "save", 1, 10);
  expect(Array.isArray(found)).toBe(true);
  expect(found.length).toBeGreaterThanOrEqual(1);

  const first = found[0] as LogDoc;
  expect(first.entity).toBe("boxes");
  expect(first.action).toBe("save");
  expect(first.message).toContain("Box salva com sucesso");
}, 25000);
