import OZMapSDK from "@ozmap/ozmap-sdk";
// import type { Cable, CreateCableDTO } from "@ozmap/ozmap-sdk";
import axios from "axios";
import { BoxIsp, CableIsp, DropCableIsp, CustomerIsp } from "./schemas/ispSchema";
import { LogDoc } from "./schemas/ozmapSchema";

const OZMAP_BASE_URL =
  process.env.OZMAP_BASE_URL ?? "http://localhost:9994/api/v2";
const OZMAP_API_KEY = process.env.OZMAP_API_KEY ?? "TEST";
export const oz: any = new (OZMapSDK as any)(OZMAP_BASE_URL, {
  apiKey: OZMAP_API_KEY,
});

export async function createCable(body: CableIsp | DropCableIsp) {
  const res = await axios.post(`${OZMAP_BASE_URL}/cables`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

export async function createBox(body: BoxIsp) {
  const res = await axios.post(`${OZMAP_BASE_URL}/boxes`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

export async function createProspect(body: CustomerIsp) {
  const res = await axios.post(`${OZMAP_BASE_URL}/prospects`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

export async function createLog(body: LogDoc) {
  const res = await axios.post(`${OZMAP_BASE_URL}/logs`, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

export async function getCable(cableType: string = "Fiber", id: string) {
  if (!id || !cableType) throw new Error("externalId e cableType são obrigatórios");
  const res = await axios.get(`${OZMAP_BASE_URL}/cables/${id}`, {
    params: { cable_type: cableType.toUpperCase() },
  });
  return res.data;
}

/** Busca Box por external_id */
export async function getBox(external_id: string) {
  if (!external_id) throw new Error("external_id é obrigatório");
  const res = await axios.get(`${OZMAP_BASE_URL}/boxes/${external_id}`);
  return res.data;
}

/** Busca Prospect por external_id */
export async function getProspect(external_id: string) {
  if (!external_id) throw new Error("external_id é obrigatório");
  const res = await axios.get(`${OZMAP_BASE_URL}/prospects/${encodeURIComponent(external_id)}`);
  return res.data;
}

export async function getLogs(
  entity: "boxes" | "customers" | "cables" | "drop_cables" | "unknown",
  action: "fetch" | "save" | "transform" | "other",
  page = 1,
  pageSize = 50
) {
  if (!entity || !action) throw new Error("entity e action são obrigatórios");

  const res = await axios.get(`${OZMAP_BASE_URL}/logs`, {
    params: {
      entity,
      action,
      page,
      pageSize,
    },
  });

  return res.data;
}
