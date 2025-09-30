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

function normalizePlan(plan: any): any {
  return {
    ...plan,
    created_at: plan.created_at instanceof Date ? plan.created_at.toISOString() : plan.created_at,
    updated_at: plan.updated_at instanceof Date ? plan.updated_at.toISOString() : plan.updated_at,
  };
}

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
  const validated = CreatePlanSchema.parse(data);
  const now = new Date().toISOString();

  const newPlan = await db
    .insertInto('plan')
    .values({
      id: randomUUID(),
      name: validated.name,
      description: validated.description ?? null,
      stripe_price_id: validated.stripe_price_id,
      stripe_product_id: validated.stripe_product_id,
      price_per_month: validated.price_per_month,
      metadata: (validated.metadata ?? {}) as JsonObject,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return PlanSchema.parse(normalizePlan(newPlan));
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
  const row = await db.selectFrom('plan').selectAll().where('id', '=', id).executeTakeFirst();
  return row ? PlanSchema.parse(normalizePlan(row)) : null;
}
/**
 * Get a plan by Stripe price ID.
 *
 * @example
 * ```ts
 * const plan = await getPlanByPriceId("price_123");
 * ```
 *
 * @internal
 */
export async function getPlanByPriceId(stripePriceId: string): Promise<Plan | null> {
  const row = await db
    .selectFrom('plan')
    .selectAll()
    .where('stripe_price_id', '=', stripePriceId)
    .executeTakeFirst();
  return row ? PlanSchema.parse(normalizePlan(row)) : null;
}

/**
 * Get a plan by Stripe product ID.
 *
 * @example
 * ```ts
 * const plan = await getPlanByProductId("prod_456");
 * ```
 *
 * @internal
 */
export async function getPlanByProductId(stripeProductId: string): Promise<Plan | null> {
  const row = await db
    .selectFrom('plan')
    .selectAll()
    .where('stripe_product_id', '=', stripeProductId)
    .executeTakeFirst();
  return row ? PlanSchema.parse(normalizePlan(row)) : null;
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
  return rows.map((row) => PlanSchema.parse(normalizePlan(row)));
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
  const validated = UpdatePlanSchema.parse(data);

  const updated = await db
    .updateTable('plan')
    .set({
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.stripe_price_id && { stripe_price_id: validated.stripe_price_id }),
      ...(validated.stripe_product_id && { stripe_product_id: validated.stripe_product_id }),
      ...(validated.price_per_month !== undefined && {
        price_per_month: validated.price_per_month,
      }),
      ...(validated.metadata && { metadata: validated.metadata as JsonObject }),
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  return updated ? PlanSchema.parse(normalizePlan(updated)) : null;
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
