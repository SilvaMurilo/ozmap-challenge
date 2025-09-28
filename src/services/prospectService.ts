import { CustomerIsp, CustomerSchema } from "../schemas/ispSchema";
import { ProspectOZmap, ProspectSchema } from "../schemas/ozmapSchema";
import { insertProspect } from "../repositories/prospectRepository";

function normalizeIspProspectToOz(input: CustomerIsp): ProspectOZmap {
  return {
    name: input.name,
    external_id: String(input.id),
    address: input.address,
    code: input.code,
    box_id: input.box_id
  };
}

export async function createProspectService(raw: unknown) {
  const prospectParsed = CustomerSchema.safeParse(raw);
  const ozPayload = ProspectSchema.parse(normalizeIspProspectToOz(prospectParsed.data));
  return insertProspect(ozPayload);
}