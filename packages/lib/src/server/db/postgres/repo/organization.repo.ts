import {
  Organization,
  CreateOrganization,
  OrganizationSchema,
  UpdateOrganization,
} from '@safeoutput/contracts/organization/schema';
import { randomUUID } from 'crypto';
import { customAlphabet, nanoid } from 'nanoid';
import { db } from '..';
import { JsonObject } from '../../types/pg-database-types';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

type Executor = Kysely<DB> | Transaction<DB>;

const safeNanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789-', 12);

/**
 * Create a new organization.
 *
 * @internal
 * @param org - The organization creation payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly created organization.
 */
export async function createOrganization(
  org: CreateOrganization,
  executor: Executor = db,
): Promise<Organization> {
  const newOrganization = await executor
    .insertInto('organization')
    .values({
      id: randomUUID(),
      name: org.name,
      slug: safeNanoid(),
      type: org.type,
      metadata: (org.metadata ?? {}) as JsonObject,
      current_plan_id: org.current_plan_id ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return OrganizationSchema.parse(newOrganization);
}

/**
 * Get an organization by its ID.
 *
 * @internal
 * @param id - The organization ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The organization if found, otherwise null.
 */
export async function getOrganizationById(
  id: string,
  executor: Executor = db,
): Promise<Organization | null> {
  const org = await executor
    .selectFrom('organization')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return org ? OrganizationSchema.parse(org) : null;
}

/**
 * Get an organization by its slug.
 *
 * @internal
 * @param slug - The organization slug.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The organization if found, otherwise null.
 */
export async function getOrganizationBySlug(
  slug: string,
  executor: Executor = db,
): Promise<Organization | null> {
  const org = await executor
    .selectFrom('organization')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst();

  return org ? OrganizationSchema.parse(org) : null;
}

/**
 * List organizations with pagination.
 *
 * @internal
 * @param limit - Maximum number of organizations to return (default 50).
 * @param offset - Number of organizations to skip before returning results (default 0).
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of organizations.
 */
export async function listOrganizations(
  limit = 50,
  offset = 0,
  executor: Executor = db,
): Promise<Organization[]> {
  const rows = await executor
    .selectFrom('organization')
    .selectAll()
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => OrganizationSchema.parse(row));
}

/**
 * List organizations filtered by type with pagination.
 *
 * @internal
 * @param type - The organization type (e.g., "Startup").
 * @param limit - Maximum number of organizations to return (default 50).
 * @param offset - Number of organizations to skip before returning results (default 0).
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of organizations of the given type.
 */
export async function listOrganizationsByType(
  type: Organization['type'],
  limit = 50,
  offset = 0,
  executor: Executor = db,
): Promise<Organization[]> {
  const rows = await executor
    .selectFrom('organization')
    .selectAll()
    .where('type', '=', type)
    .limit(limit)
    .offset(offset)
    .orderBy('type', 'asc')
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => OrganizationSchema.parse(row));
}

/**
 * Update an organization by ID.
 *
 * @internal
 * @param id - The organization ID.
 * @param data - Partial update payload for the organization.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The updated organization if found, otherwise null.
 */
export async function updateOrganization(
  id: string,
  data: UpdateOrganization,
  executor: Executor = db,
): Promise<Organization | null> {
  const updated = await executor
    .updateTable('organization')
    .set({
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.type && { type: data.type }),
      ...(data.metadata && { metadata: data.metadata as JsonObject }),
      ...(data.subscription_status !== undefined && {
        subscription_status: data.subscription_status,
      }),
      ...(data.current_plan_id !== undefined && {
        current_plan_id: data.current_plan_id,
      }),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  return updated ? OrganizationSchema.parse(updated) : null;
}

/**
 * Delete an organization by ID.
 *
 * @internal
 * @param id - The organization ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the organization was deleted, otherwise false.
 */
export async function deleteOrganization(id: string, executor: Executor = db): Promise<boolean> {
  const res = await executor.deleteFrom('organization').where('id', '=', id).executeTakeFirst();
  return (res.numDeletedRows ?? 0) > 0;
}
