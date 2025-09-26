import { z } from "zod";

const Id = z.number().int().positive();
const Lat = z.number().min(-90).max(90);
const Lng = z.number().min(-180).max(180);

export const GeoPointSchema = z.object({
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

export const DropCableSchema = z.object({
  id: Id,
  name: z.string().min(1),
  box_id: Id,
  customer_id: Id,
});

export const BoxSchema = z.object({
  id: Id,
  name: z.string().min(1),
  type: z.enum(["Nap", "Splitter"]),
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

export const NetworkSchema = z.object({
  cables: z.array(CableSchema),
  drop_cables: z.array(DropCableSchema),
  boxes: z.array(BoxSchema),
  customers: z.array(CustomerSchema),
});

export type Network = z.infer<typeof NetworkSchema>;
export type Cable = z.infer<typeof CableSchema>;
export type DropCable = z.infer<typeof DropCableSchema>;
export type Box = z.infer<typeof BoxSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
