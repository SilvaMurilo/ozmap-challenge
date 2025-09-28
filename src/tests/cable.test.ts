import { createCable } from "../ozSdk";
import { expect, it } from "vitest";

it("Should create a drop cable", async () => {
  const payload = {
    id: 1,
    name: "Drop Cable 1",
    box_id: 1,
    customer_id: 1,
  };
  const result = await createCable(payload);
  expect(result.name).toBe("Drop Cable 1");
});

it("Should create a fiber cable", async () => {
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
