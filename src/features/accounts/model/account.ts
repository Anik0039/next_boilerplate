import { z } from "zod";

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  maskedNumber: z.string(),
  currency: z.string().length(3),
  availableBalance: z.number(),
  status: z.string(),
});

export const balanceEventSchema = z.object({
  id: z.string(),
  availableBalance: z.number(),
  observedAt: z.iso.datetime(),
});

export type Account = z.infer<typeof accountSchema>;
