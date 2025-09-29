import { createCable, getCable } from "../ozSdk";
import { expect, it } from "vitest";
import { getCableByTypeAndExternalId } from "../repositories/cableRepository";
import { getCableService } from "../services/cableService";

it("Should create and get Cable by (cable_type, external_id)", async () => {
  const dto =  {
    id: Math.floor(Math.random() * 10000) + 1,    
    name: "Drop Cable 3"
  };
  const created = await createCable(dto);
  const found = await getCable("DROP", String(dto.id));
  expect(found).toBeDefined();
  expect(found!.external_id).toEqual(created.external_id);
  expect(found!.cable_type).toBe("DROP");
  expect(found!.name).toBe(created.name);
});


it("Should create a drop cable", async () => {
  const payload = {
    id: Math.floor(Math.random() * 10000) + 1,
    name: "Drop Cable 1"    
  };
  const result = await createCable(payload);
  expect(result.name).toBe("Drop Cable 1");
});

it("Should create a fiber cable", async () => {
  const payload = {
    id: Math.floor(Math.random() * 10000) + 1,
    name: "Fiber Route A",
    capacity: 144,
    boxes_connected: [1, 2],
    path: [
      { lat: -27.595377, lng: -48.54805 },
      { lat: -27.597712, lng: -48.547623 },
      { lat: -27.59934, lng: -48.54718 },
      { lat: -27.601126, lng: -48.546673 },
    ],
  };
  const result = await createCable(payload);
  expect(result.name).toBe("Fiber Route A");
});
