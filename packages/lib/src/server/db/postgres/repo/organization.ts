import {
  Organization,
  CreateOrganization,
  OrganizationSchema,
  UpdateOrganization,
} from '@safeoutput/contracts/organization/schema';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { db } from '..';
import { JsonObject } from '../../types/pg-database-types';

/**
 * Create a new organization.
 *
 * @example
 * ```ts
 * const org = await createOrganization({
 *   name: "Acme Inc",
 *   slug: "acme-inc",
 *   type: "Startup",
 * });
 * ```
 *
 * @internal
 */
export async function createOrganization(org: CreateOrganization): Promise<Organization> {
  const newOrganization = await db
    .insertInto('organization')
    .values({
      id: randomUUID(),
      name: org.name,
      slug: org.slug ?? nanoid(),
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
 * @example
 * ```ts
 * const org = await getOrganizationById("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * ```
 *
 * @internal
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const org = await db
    .selectFrom('organization')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return org ? OrganizationSchema.parse(org) : null;
}

/**
 * Get an organization by its slug.
 *
 * @example
 * ```ts
 * const org = await getOrganizationBySlug("acme-inc");
 * ```
 *
 * @internal
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const org = await db
    .selectFrom('organization')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst();

  return org ? OrganizationSchema.parse(org) : null;
}

/**
 * List organizations (with pagination).
 *
 * @example
 * ```ts
 * const orgs = await listOrganizations(20, 0); // first 20
 * ```
 *
 * @internal
 */
export async function listOrganizations(limit = 50, offset = 0): Promise<Organization[]> {
  const rows = await db
    .selectFrom('organization')
    .selectAll()
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => OrganizationSchema.parse(row));
}

/**
 * List organizations by type (with pagination).
 *
 * @example
 * ```ts
 * const startups = await listOrganizationsByType("Startup", 20, 0);
 * ```
 *
 * @internal
 */
export async function listOrganizationsByType(
  type: Organization['type'],
  limit = 50,
  offset = 0,
): Promise<Organization[]> {
  const rows = await db
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
 * Update an organization.
 *
 * @example
 * ```ts
 * const updated = await updateOrganization("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
 *   name: "Acme International",
 * });
 * ```
 *
 * @internal
 */
export async function updateOrganization(
  id: string,
  data: UpdateOrganization,
): Promise<Organization | null> {
  const updated = await db
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
 * @example
 * ```ts
 * const deleted = await deleteOrganization("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * if (deleted) console.log("Deleted!");
 * ```
 *
 * @internal
 */
export async function deleteOrganization(id: string): Promise<boolean> {
  const res = await db.deleteFrom('organization').where('id', '=', id).executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}
