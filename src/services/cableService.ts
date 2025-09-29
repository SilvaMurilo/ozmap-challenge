import { z } from "zod";
import { getCableByTypeAndExternalId, insertCable } from "../repositories/cableRepository";
import {
  CableSchema as IspCableSchema,
  IspDropCableSchema,
} from "../schemas/ispSchema";
import {
  CableSchema as OzCableSchema,
  type CableOZmap,
} from "../schemas/ozmapSchema";

function normalizeIspCableToOz(
  input: z.infer<typeof IspCableSchema>
): CableOZmap {
  return {
    cable_type: String(input.name).split(" ")[0].toUpperCase(),
    box_a: String(input.boxes_connected[0]),
    box_b: String(input.boxes_connected?.[1] ?? ""),
    name: input.name,
    poles: input.path,
    external_id: String(input.id),
    length: input.capacity,
  };
}

function normalizeIspDropCableToOz(
  input: z.infer<typeof IspDropCableSchema>
): CableOZmap {
  return {
    external_id: String(input.id),
    name: input.name,
    box_id: input.box_id,
    prospects_id: input.customer_id,
    cable_type: "DROP",
  };
}

export async function createCableService(raw: unknown) {
  const commonCableParsed = IspCableSchema.safeParse(raw);
  const dropCableParsed = IspDropCableSchema.safeParse(raw);
  console.log("[createCableService] Parsed cable:", commonCableParsed, dropCableParsed);
  let ozFormat;
  if (commonCableParsed.success)
    ozFormat = normalizeIspCableToOz(commonCableParsed.data);
  else if (dropCableParsed.success)
    ozFormat = normalizeIspDropCableToOz(dropCableParsed.data);
  const ozPayload = OzCableSchema.parse(ozFormat);
  console.log("[createCableService] Inserting cable:", ozPayload);
  return insertCable(ozPayload);
}

export async function getCableService(cableType: string, externalId: string) {
  const cable = await getCableByTypeAndExternalId(cableType, externalId);
  return cable ?? null;
}