import { db } from "../config/db";
import { sql } from "kysely";
import { BoxOZmap } from "../schemas/ozmapSchema";

export async function insertBox(dto: BoxOZmap) {
  const result = await db
    .insertInto("boxes")
    .values({
      ...dto,
      coords: JSON.stringify(dto.coords),
    })
    .executeTakeFirstOrThrow();

  const insertId =
    (result as unknown as { insertId?: number }).insertId ??
    (
      await db
        .selectFrom("boxes")
        .select(sql<number>`LAST_INSERT_ID()`.as("id"))
        .executeTakeFirst()
    )?.id;

  if (!insertId) return null;

  const row = await db
    .selectFrom("boxes")
    .selectAll()
    .where("id", "=", Number(insertId))
    .executeTakeFirstOrThrow();

  return row;
}

export async function getBoxByExternalId(externalId: string) {
  const result = await db
    .selectFrom("boxes")
    .selectAll()
    .where("external_id", "=", externalId)
    .executeTakeFirst();
    return {...result, id: +result.id, external_id: +result.external_id };
}
