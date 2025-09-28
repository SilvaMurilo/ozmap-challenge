import { z } from "zod";

const Str36 = z.string().max(36);
const Str100 = z.string().max(100);

export const ProspectSchema = z.object({
  code: Str100.optional(),
  name: Str100.optional(),
  address: z.string().max(255).optional(),
  external_id: Str36.optional(),
});

export const OzmapBoxSchema = z.object({  
  name: Str100.optional(),
  kind: z.enum(['Box','Building','Property','Pop', 'Splitter', 'Nap']),
  coords: z.tuple([z.number(), z.number()]),
  external_id: Str36,
  project: z.string().max(36).optional()
});

const PoleSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const CableSchema = z.object({  
  cable_type: Str100,
  box_a: z.string().max(8).optional(),
  box_b: z.string().max(8).optional(),
  name: Str100,
  poles: z.array(PoleSchema).min(1).optional(),
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
  ).optional(),
  box_id: z.number().int().nonnegative().optional(),
  prospects_id: z.number().int().nonnegative().optional(),
  project: z.string().max(36).optional()
});

export type ProspectOZmap = z.infer<typeof ProspectSchema>;
export type BoxOZmap = z.infer<typeof OzmapBoxSchema>;
export type CableOZmap = z.infer<typeof CableSchema>;
