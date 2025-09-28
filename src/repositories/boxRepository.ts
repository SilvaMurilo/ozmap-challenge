import { db } from '../config/db';
import { sql } from 'kysely';
import { BoxOZmap, CableOZmap } from '../schemas/ozmapSchema';

export async function insertBox(dto: BoxOZmap) {
  const result = await db
    .insertInto('boxes')
    .values({
      ...dto,
      coords: JSON.stringify(dto.coords)
    })
    .executeTakeFirstOrThrow();

  const insertId =
    (result as unknown as { insertId?: number }).insertId ??
    (
      await db
        .selectFrom('boxes')
        .select(sql<number>`LAST_INSERT_ID()`.as('id'))
        .executeTakeFirst()
    )?.id;

  if (!insertId) return null;

  const row = await db
    .selectFrom('boxes')
    .selectAll()
    .where('id', '=', Number(insertId))
    .executeTakeFirstOrThrow();

  return row
}