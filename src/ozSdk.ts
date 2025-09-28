import OZMapSDK from "@ozmap/ozmap-sdk";
// import type { Cable, CreateCableDTO } from "@ozmap/ozmap-sdk";
import axios from "axios";
import { CableOZmap } from "./schemas/ozmapSchema";
import { CableIsp, DropCableIsp } from "./schemas/ispSchema";

const OZMAP_BASE_URL = process.env.OZMAP_BASE_URL ?? "http://localhost:9994/api/v2";
const OZMAP_API_KEY  = process.env.OZMAP_API_KEY  ?? "TEST";
export const oz: any = new (OZMapSDK as any)(OZMAP_BASE_URL, { apiKey: OZMAP_API_KEY });



export async function createCable(body: CableIsp | DropCableIsp) {  
    const res = await axios.post(`${OZMAP_BASE_URL}/cables`, body, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    return res.data;
}
