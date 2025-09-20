import { z } from 'zod';

export const PlanSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  stripe_price_id: z.string().max(255),
  stripe_product_id: z.string().max(255),
  price_per_month: z.number().nonnegative(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  stripe_price_id: z.string().max(255),
  stripe_product_id: z.string().max(255),
  price_per_month: z.number().nonnegative(),
});

export const UpdatePlanSchema = CreatePlanSchema.partial();

export type Plan = z.infer<typeof PlanSchema>;
export type CreatePlan = z.infer<typeof CreatePlanSchema>;
export type UpdatePlan = z.infer<typeof UpdatePlanSchema>;
