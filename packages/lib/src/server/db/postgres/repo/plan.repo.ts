import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

import {
  Plan,
  PlanSchema,
  CreatePlan,
  CreatePlanSchema,
  UpdatePlan,
  UpdatePlanSchema,
} from '@safeoutput/contracts/plan/schema';

type Executor = Kysely<DB> | Transaction<DB>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * @internal
 * @param data - The plan creation payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly created plan.
 */
export async function createPlan(data: CreatePlan, executor: Executor = db): Promise<Plan> {
  const validated = CreatePlanSchema.parse(data);
  const now = new Date().toISOString();

  const newPlan = await executor
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
 * @internal
 * @param id - The plan ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The plan if found, otherwise null.
 */
export async function getPlanById(id: string, executor: Executor = db): Promise<Plan | null> {
  const row = await executor.selectFrom('plan').selectAll().where('id', '=', id).executeTakeFirst();

  return row ? PlanSchema.parse(normalizePlan(row)) : null;
}

/**
 * Get a plan by Stripe price ID.
 *
 * @internal
 * @param stripePriceId - The Stripe price ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The plan if found, otherwise null.
 */
export async function getPlanByPriceId(
  stripePriceId: string,
  executor: Executor = db,
): Promise<Plan | null> {
  const row = await executor
    .selectFrom('plan')
    .selectAll()
    .where('stripe_price_id', '=', stripePriceId)
    .executeTakeFirst();

  return row ? PlanSchema.parse(normalizePlan(row)) : null;
}

/**
 * Get a plan by Stripe product ID.
 *
 * @internal
 * @param stripeProductId - The Stripe product ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The plan if found, otherwise null.
 */
export async function getPlanByProductId(
  stripeProductId: string,
  executor: Executor = db,
): Promise<Plan | null> {
  const row = await executor
    .selectFrom('plan')
    .selectAll()
    .where('stripe_product_id', '=', stripeProductId)
    .executeTakeFirst();

  return row ? PlanSchema.parse(normalizePlan(row)) : null;
}

/**
 * List all plans (with pagination).
 *
 * @internal
 * @param limit - Maximum number of plans to return.
 * @param offset - Number of plans to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of plans.
 */
export async function listPlans(limit = 50, offset = 0, executor: Executor = db): Promise<Plan[]> {
  const rows = await executor
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
 * @internal
 * @param id - The plan ID.
 * @param data - Partial update payload for the plan.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The updated plan if found, otherwise null.
 */
export async function updatePlan(
  id: string,
  data: UpdatePlan,
  executor: Executor = db,
): Promise<Plan | null> {
  const validated = UpdatePlanSchema.parse(data);

  const updated = await executor
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
 * @internal
 * @param id - The plan ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the plan was deleted, otherwise false.
 */
export async function deletePlan(id: string, executor: Executor = db): Promise<boolean> {
  const res = await executor.deleteFrom('plan').where('id', '=', id).executeTakeFirst();
  return (res.numDeletedRows ?? 0) > 0;
}
