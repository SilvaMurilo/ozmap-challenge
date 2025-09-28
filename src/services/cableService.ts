import { z } from "zod";
import { insertCable } from "../repositories/cableRepository";
import {
  CableSchema as IspCableSchema,
  IspDropCableSchema,
} from "../schemas/ispSchema";
import {
  CableSchema as OzCableSchema,
  type CableOZmap,
} from "../schemas/ozmapSchema";
import { CableSchema } from "@ozmap/ozmap-sdk";

function normalizeIspCableToOz(
  input: z.infer<typeof IspCableSchema>
): CableOZmap {
  return {
    cable_type: String(input.name).split(" ")[0].toUpperCase(),
    box_a: String(input.boxes_connected[0]),
    box_b: String(input.boxes_connected[1]),
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
  
  let ozPayload;
  if (commonCableParsed.success) {
    console.log("commonCableParsed", commonCableParsed);
    const ozFormat = normalizeIspCableToOz(commonCableParsed.data);
    ozPayload = OzCableSchema.parse(ozFormat);
  } else if (dropCableParsed.success) {
    console.log("dropCableParsed", dropCableParsed);
    const ozFormat = normalizeIspDropCableToOz(dropCableParsed.data);
    ozPayload = OzCableSchema.parse(ozFormat);
    console.log(ozPayload)
  }
  return insertCable(ozPayload);
}
