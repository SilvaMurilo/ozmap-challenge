// cable.repo.ts
import { db } from '../config/db';
import { sql } from 'kysely';
import { CableOZmap } from '../schemas/ozmapSchema';

export async function insertCable(dto: CableOZmap) {
  const result = await db
    .insertInto('cables')
    .values({
      ...dto,
      poles: JSON.stringify(dto.poles)
    })
    .executeTakeFirstOrThrow();

  const insertId =
    (result as unknown as { insertId?: number }).insertId ??
    (
      await db
        .selectFrom('cables')
        .select(sql<number>`LAST_INSERT_ID()`.as('id'))
        .executeTakeFirst()
    )?.id;

  if (!insertId) return null;

  const row = await db
    .selectFrom('cables')
    .selectAll()
    .where('id', '=', Number(insertId))
    .executeTakeFirstOrThrow();

  return {
    ...row,
    poles: typeof row.poles === 'string' ? JSON.parse(row.poles) : row.poles,
  };
}