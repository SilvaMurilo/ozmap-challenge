import { z } from 'zod';
import { insertCable } from '../repositories/cable';
import { CableSchema as IspCableSchema } from '../schemas/ispSchema';
import { CableSchema as OzCableSchema, type CableOZmap } from '../schemas/ozmapSchema';

function normalizeIspToOz(input: z.infer<typeof IspCableSchema>): CableOZmap {
 return {    
  cable_type: String(input.name).split(' ')[0],
  box_a: String(input.boxes_connected[0]),
  box_b: String(input.boxes_connected[1]),
  name: input.name,
  poles: input.path,
  external_id: String(input.id),
  length: input.capacity
}
}

export async function createCableService(raw: unknown) {
  const ispParsed = IspCableSchema.parse(raw);
  const ozFormat = normalizeIspToOz(ispParsed);
  const ozPayload = OzCableSchema.parse(ozFormat);

  return insertCable(ozPayload);
}
