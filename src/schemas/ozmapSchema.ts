import { z } from "zod";

const Str36 = z.string().max(36);
const Str100 = z.string().max(100);

export const ProspectSchema = z.object({
  code: Str100.optional(),
  name: Str100.optional(),
  address: z.string().max(255).optional(),
  external_id: Str36.optional(),
});

export const BoxSchema = z.object({
  project: z.string().max(36).default("Murilo's Net"),
  name: Str100.optional(),
  kind: z.enum(["Box", "Building", "Property", "Pop"]),
  coords: z.tuple([z.number(), z.number()]),
  external_id: Str36.optional(),
});

const PoleSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const CableSchema = z.object({
  project: z.string().max(36).default("Murilo's Net"),
  cable_type: Str100,
  box_a: z.string().max(8),
  box_b: z.string().max(8),
  name: Str100,
  poles: z.array(PoleSchema).min(1),
  external_id: Str36,
  length: z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z
      .number()
      .nonnegative()
      .refine(
        (n) => Math.round(n * 100) === n * 100,
        "deve ter 2 casas decimais"
      )
  ),
  box_id: z.number().int().nonnegative().optional(),
  prospects_id: z.number().int().nonnegative().optional(),
});

export type Prospect = z.infer<typeof ProspectSchema>;
export type Box = z.infer<typeof BoxSchema>;
export type Cable = z.infer<typeof CableSchema>;
