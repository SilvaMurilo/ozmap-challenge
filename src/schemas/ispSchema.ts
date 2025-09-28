import { z } from "zod";

const Id = z.number().int().positive();
const Lat = z.number().min(-90).max(90);
const Lng = z.number().min(-180).max(180);

const GeoPointSchema = z.object({
  lat: Lat,
  lng: Lng,
});

export const CableSchema = z.object({
  id: Id,
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  boxes_connected: z.array(Id).min(1),
  path: z.array(GeoPointSchema).min(2),
});

export const IspDropCableSchema = z.object({
  id: Id,
  name: z.string().min(1),
  box_id: Id,
  customer_id: Id,
});

export const IspBoxSchema = z.object({
  id: Id,
  name: z.string().min(1),
  type: z.enum(['Box','Building','Property','Pop', 'Splitter', 'Nap']),
  lat: Lat,
  lng: Lng,
});

export const CustomerSchema = z.object({
  id: Id,
  code: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  box_id: Id,
});

export type CableIsp = z.infer<typeof CableSchema>;
export type DropCableIsp = z.infer<typeof IspDropCableSchema>;
export type BoxIsp = z.infer<typeof IspBoxSchema>;
export type CustomerIsp = z.infer<typeof CustomerSchema>;
