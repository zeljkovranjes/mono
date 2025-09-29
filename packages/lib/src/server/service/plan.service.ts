import { Plan, CreatePlan, UpdatePlan } from '@safeoutput/contracts/plan/schema';

import {
  createPlan as createPlanRepo,
  getPlanById as getPlanByIdRepo,
  getPlanByPriceId as getPlanByPriceIdRepo,
  getPlanByProductId as getPlanByProductIdRepo,
  listPlans as listPlansRepo,
  updatePlan as updatePlanRepo,
  deletePlan as deletePlanRepo,
} from '../db/postgres/repo/plan.repo';

import { createAuditLog } from '../db/postgres/repo/audit.repo';

/**
 * Service: create a new plan and log an audit entry.
 *
 * @param userId - The ID of the user creating the plan.
 * @param data - The plan creation payload.
 * @returns The newly created plan.
 */
export async function createPlan(userId: string, data: CreatePlan): Promise<Plan> {
  const plan = await createPlanRepo(data);

  await createAuditLog({
    actor_id: userId,
    entity_type: 'plan',
    entity_id: plan.id,
    event_type: 'plan.created',
    diff: data as Record<string, unknown>,
    context: {},
  });

  return plan;
}

/**
 * Service: fetch a plan by ID.
 *
 * @param id - The unique plan ID.
 * @returns The plan if found, otherwise null.
 */
export async function getPlanById(id: string): Promise<Plan | null> {
  return getPlanByIdRepo(id);
}

/**
 * Service: fetch a plan by Stripe price ID.
 *
 * @param stripePriceId - The Stripe price ID.
 * @returns The plan if found, otherwise null.
 */
export async function getPlanByPriceId(stripePriceId: string): Promise<Plan | null> {
  return getPlanByPriceIdRepo(stripePriceId);
}

/**
 * Service: fetch a plan by Stripe product ID.
 *
 * @param stripeProductId - The Stripe product ID.
 * @returns The plan if found, otherwise null.
 */
export async function getPlanByProductId(stripeProductId: string): Promise<Plan | null> {
  return getPlanByProductIdRepo(stripeProductId);
}

/**
 * Service: list all plans with pagination.
 *
 * @param limit - Maximum number of plans to return.
 * @param offset - Number of plans to skip before returning results.
 * @returns An array of plans.
 */
export async function listPlans(limit = 50, offset = 0): Promise<Plan[]> {
  return listPlansRepo(limit, offset);
}

/**
 * Service: update a plan and log an audit entry.
 *
 * @param userId - The ID of the user performing the update.
 * @param id - The plan ID to update.
 * @param data - Partial plan update payload.
 * @returns The updated plan if found, otherwise null.
 */
export async function updatePlan(
  userId: string,
  id: string,
  data: UpdatePlan,
): Promise<Plan | null> {
  const updated = await updatePlanRepo(id, data);

  if (updated) {
    await createAuditLog({
      actor_id: userId,
      entity_type: 'plan',
      entity_id: id,
      event_type: 'plan.updated',
      diff: data as Record<string, unknown>,
      context: {},
    });
  }

  return updated;
}

/**
 * Service: delete a plan by ID and log the action.
 *
 * @param userId - The ID of the user performing the deletion.
 * @param id - The plan ID to delete.
 * @returns True if the plan was deleted, otherwise false.
 */
export async function deletePlan(userId: string, id: string): Promise<boolean> {
  const deleted = await deletePlanRepo(id);

  if (deleted) {
    await createAuditLog({
      actor_id: userId,
      entity_type: 'plan',
      entity_id: id,
      event_type: 'plan.deleted',
      diff: {},
      context: {},
    });
  }

  return deleted;
}
