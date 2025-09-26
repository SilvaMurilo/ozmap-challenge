import { externalId } from "@ozmap/ozmap-sdk";
import { createCable } from "../ozSdk";
import { expect, it } from "vitest";

async function createCableServices(payload: any) {
  const result = await createCable(payload);
  return result;
}

it("Should criar cabo", async () => {
  const payload = {
    id: 1,
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
