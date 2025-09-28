import { createBox } from "../ozSdk";
import { expect, it } from "vitest";

it("Should create a box", async () => {
  const payload = {
      id: 1,
      name: "Box 1",
      type: "Nap" as const,
      lat: -27.597712,
      lng: -48.547623
    };
  const result = await createBox(payload);
  expect(result.name).toBe("Box 1");
});