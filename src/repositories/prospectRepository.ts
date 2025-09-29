import { db } from '../config/db';
import { sql } from 'kysely';
import { ProspectOZmap } from '../schemas/ozmapSchema';

export async function insertProspect(dto: ProspectOZmap) {
  const result = await db
    .insertInto('prospects')
    .values(dto)
    .executeTakeFirstOrThrow();

  const insertId =
    (result as unknown as { insertId?: number }).insertId ??
    (
      await db
        .selectFrom('prospects')
        .select(sql<number>`LAST_INSERT_ID()`.as('id'))
        .executeTakeFirst()
    )?.id;

  if (!insertId) return null;

  const row = await db
    .selectFrom('prospects')
    .selectAll()
    .where('id', '=', Number(insertId))
    .executeTakeFirstOrThrow();

  return row;
}

export async function getProspectByExternalId(externalId: string) {
  return db
    .selectFrom("prospects")
    .selectAll()
    .where("external_id", "=", externalId)
    .executeTakeFirst();
}