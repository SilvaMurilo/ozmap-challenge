import { insertBox } from "../repositories/boxRepository";
import { BoxIsp, IspBoxSchema } from "../schemas/ispSchema";
import { BoxOZmap, OzmapBoxSchema } from "../schemas/ozmapSchema";

function normalizeIspBoxToOz(input: BoxIsp): BoxOZmap {
  return {
    name: input.name,
    coords: [input.lat, input.lng],
    kind: input.type as
      | "Nap"
      | "Box"
      | "Building"
      | "Property"
      | "Pop"
      | "Splitter",
    external_id: String(input.id),
  };
}

export async function createBoxService(raw: unknown) {
  const boxParsed = IspBoxSchema.safeParse(raw);
  const ozPayload = OzmapBoxSchema.parse(normalizeIspBoxToOz(boxParsed.data));
  return insertBox(ozPayload);
}
