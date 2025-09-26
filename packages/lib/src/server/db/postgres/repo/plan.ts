import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';

import {
  Plan,
  PlanSchema,
  CreatePlan,
  CreatePlanSchema,
  UpdatePlan,
  UpdatePlanSchema,
} from '@safeoutput/contracts/plan/schema';

/**
 * Create a new plan.
 *
 * @example
 * ```ts
 * const plan = await createPlan({
 *   name: "Pro",
 *   description: "Pro tier with advanced features",
 *   stripe_price_id: "price_123",
 *   stripe_product_id: "prod_456",
 *   price_per_month: 29,
 * });
 * ```
 *
 * @internal
 */
export async function createPlan(data: CreatePlan): Promise<Plan> {
  CreatePlanSchema.parse(data);

  const now = new Date().toISOString();

  const newPlan = await db
    .insertInto('plan')
    .values({
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      stripe_price_id: data.stripe_price_id,
      stripe_product_id: data.stripe_product_id,
      price_per_month: data.price_per_month,
      metadata: (data.metadata ?? {}) as JsonObject,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return PlanSchema.parse(newPlan);
}

/**
 * Get a plan by ID.
 *
 * @example
 * ```ts
 * const plan = await getPlanById("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * ```
 *
 * @internal
 */
export async function getPlanById(id: string): Promise<Plan | null> {
  const plan = await db.selectFrom('plan').selectAll().where('id', '=', id).executeTakeFirst();

  return plan ? PlanSchema.parse(plan) : null;
}

/**
 * List all plans (with pagination).
 *
 * @example
 * ```ts
 * const plans = await listPlans(20, 0);
 * ```
 *
 * @internal
 */
export async function listPlans(limit = 50, offset = 0): Promise<Plan[]> {
  const rows = await db
    .selectFrom('plan')
    .selectAll()
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => PlanSchema.parse(row));
}

/**
 * Update a plan.
 *
 * @example
 * ```ts
 * const updated = await updatePlan("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
 *   price_per_month: 49,
 * });
 * ```
 *
 * @internal
 */
export async function updatePlan(id: string, data: UpdatePlan): Promise<Plan | null> {
  UpdatePlanSchema.parse(data);

  const updated = await db
    .updateTable('plan')
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.stripe_price_id && { stripe_price_id: data.stripe_price_id }),
      ...(data.stripe_product_id && { stripe_product_id: data.stripe_product_id }),
      ...(data.price_per_month !== undefined && { price_per_month: data.price_per_month }),
      ...(data.metadata && { metadata: data.metadata as JsonObject }),
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  return updated ? PlanSchema.parse(updated) : null;
}

/**
 * Delete a plan by ID.
 *
 * @example
 * ```ts
 * const deleted = await deletePlan("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * if (deleted) console.log("Deleted!");
 * ```
 *
 * @internal
 */
export async function deletePlan(id: string): Promise<boolean> {
  const res = await db.deleteFrom('plan').where('id', '=', id).executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}
