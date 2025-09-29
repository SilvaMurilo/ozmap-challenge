import { create } from "domain";
import { createBox, getBox } from "../ozSdk";
import { expect, it } from "vitest";

it("Should create and get Box by external_id", async () => {
  const dto =  {
    id: Math.floor(Math.random() * 10000) + 1,
    name: "Box 23",
    type: "Nap" as const,
    lat: -20.125912,
    lng: -38.762332,
  };
  const created = await createBox(dto);
  const found = await getBox(created.external_id);
  expect(found).toBeDefined();
  expect(found!.external_id).toBe(dto.id);
  expect(found!.name).toBe(dto.name);
  expect(found!.coords[0]).toBe(dto.lat);
  expect(found!.coords[1]).toBe(dto.lng);
});

it("Should create a box", async () => {
  const payload = {
    id: Math.floor(Math.random() * 10000) + 1,
    name: "Box 1",
    type: "Nap" as const,
    lat: -27.597712,
    lng: -48.547623,
  };
  const result = await createBox(payload);
  expect(result.name).toBe("Box 1");
});
