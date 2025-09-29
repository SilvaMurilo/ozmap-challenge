import { createBox, createProspect, getProspect } from "../ozSdk";
import { expect, it } from "vitest";

it("Should create and get Prospect by external_id", async () => {
  const dto = {
    id: Math.floor(Math.random() * 10000) + 1,
      code: "CUST-002",
      name: "John Doe",
      address: "123 Main Street",
      box_id: 1
  };

  const created = await createProspect(dto);
  const found = await getProspect(String(dto.id));
  expect(found).toBeDefined();
  expect(found!.external_id).toEqual(created.external_id);
  expect(found!.name).toBe(created.name);
  expect(found!.address).toBe(created.address);
});

it("Should create a prospect", async () => {
  const payload = {
      id: Math.floor(Math.random() * 10000) + 1,
      code: "CUST-001",
      name: "John Doe",
      address: "123 Main Street",
      box_id: 1
    };
  const result = await createProspect(payload);
  expect(result.name).toBe("John Doe");
});
