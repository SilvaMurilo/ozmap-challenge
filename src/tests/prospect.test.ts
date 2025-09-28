import { createBox, createProspect } from "../ozSdk";
import { expect, it } from "vitest";

it("Should create a prospect", async () => {
  const payload = {
      id: 1,
      code: "CUST-001",
      name: "John Doe",
      address: "123 Main Street",
      box_id: 1
    };
  const result = await createProspect(payload);
  expect(result.name).toBe("John Doe");
});
