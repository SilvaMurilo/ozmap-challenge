// cable.repo.ts
import { db } from '../config/db';
import { sql } from 'kysely';
import { CableOZmap } from '../schemas/ozmapSchema';

export async function insertCable(dto: CableOZmap) {
  const result = await db
    .insertInto('cables')
    .values({      
      cable_type: String(dto.cable_type),
      box_a: String(dto.box_a),
      box_b: String(dto.box_b),
      name: String(dto.name),
      poles: JSON.stringify(dto.poles),
      external_id: String(dto.external_id),
      length: Number(dto.length),
      project: String(dto.project ?? ''),
      box_id: dto.box_id ?? null,
      prospects_id: dto.prospects_id ?? null,
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