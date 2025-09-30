import {
  Organization,
  CreateOrganization,
  UpdateOrganization,
} from '@safeoutput/contracts/organization/schema';

import {
  createOrganization,
  getOrganizationById,
  getOrganizationBySlug as getOrganizationBySlugRepo,
  listOrganizations as listOrganizationsRepo,
  listOrganizationsByType as listOrganizationsByTypeRepo,
  updateOrganization as updateOrganizationRepo,
  deleteOrganization as deleteOrganizationRepo,
} from '../db/postgres/repo/organization.repo';

import { addOrganizationMember } from '../db/postgres/repo/organizationMember.repo';
import { createAuditLog } from '../db/postgres/repo/audit.repo';
import { db } from '../db/postgres';

/**
 * Service: create a new organization and assign the creator as the first member.
 *
 * @param userId - The ID of the user who will own the organization.
 * @param data - The organization creation payload.
 * @returns The newly created organization.
 *
 * @example
 * ```ts
 * const org = await createOrganizationWithOwner("user-uuid", {
 *   name: "Acme Inc",
 *   slug: "acme-inc",
 *   type: "Startup",
 * });
 * ```
 */
export async function createOrganizationWithOwner(
  userId: string,
  data: CreateOrganization,
): Promise<Organization> {
  return db.transaction().execute(async (trx) => {
    const org = await createOrganization(data, trx);

    await addOrganizationMember(org.id, { user_id: userId }, trx);

    await createAuditLog(
      {
        actor_id: userId,
        entity_type: 'organization',
        entity_id: org.id,
        event_type: 'organization.created',
        diff: {},
        context: {},
      },
      trx,
    );

    return org;
  });
}

/**
 * Service: fetch an organization by ID.
 *
 * @param id - The unique organization ID.
 * @returns The organization if found, otherwise null.
 *
 * @example
 * ```ts
 * const org = await getOrganization("org-uuid");
 * if (org) console.log(org.name);
 * ```
 */
export async function getOrganization(id: string): Promise<Organization | null> {
  return getOrganizationById(id);
}

/**
 * Service: fetch an organization by slug.
 *
 * @param slug - The unique slug of the organization.
 * @returns The organization if found, otherwise null.
 *
 * @example
 * ```ts
 * const org = await getOrganizationBySlug("acme-inc");
 * ```
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  return getOrganizationBySlugRepo(slug);
}

/**
 * Service: list organizations with pagination.
 *
 * @param limit - Maximum number of organizations to return.
 * @param offset - Number of organizations to skip before returning results.
 * @returns An array of organizations.
 *
 * @example
 * ```ts
 * const orgs = await listOrganizations(20, 0);
 * ```
 */
export async function listOrganizations(limit = 50, offset = 0): Promise<Organization[]> {
  return listOrganizationsRepo(limit, offset);
}

/**
 * Service: list organizations filtered by type.
 *
 * @param type - The organization type (e.g., "Startup", "Agency").
 * @param limit - Maximum number of organizations to return.
 * @param offset - Number of organizations to skip before returning results.
 * @returns An array of organizations.
 *
 * @example
 * ```ts
 * const startups = await listOrganizationsByType("Startup", 10, 0);
 * ```
 */
export async function listOrganizationsByType(
  type: Organization['type'],
  limit = 50,
  offset = 0,
): Promise<Organization[]> {
  return listOrganizationsByTypeRepo(type, limit, offset);
}

/**
 * Service: update an organization and log an audit entry.
 *
 * @param userId - The ID of the user performing the update.
 * @param id - The organization ID to update.
 * @param data - Partial organization update payload.
 * @returns The updated organization if found, otherwise null.
 *
 * @example
 * ```ts
 * const updated = await updateOrganization("user-uuid", "org-uuid", { name: "New Name" });
 * ```
 */
export async function updateOrganization(
  userId: string,
  id: string,
  data: UpdateOrganization,
): Promise<Organization | null> {
  return db.transaction().execute(async (trx) => {
    const updated = await updateOrganizationRepo(id, data, trx);

    if (updated) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'organization',
          entity_id: id,
          event_type: 'organization.updated',
          diff: data as Record<string, unknown>,
          context: {},
        },
        trx,
      );
    }

    return updated;
  });
}

/**
 * Service: delete an organization by ID and log the action.
 *
 * @param userId - The ID of the user performing the deletion.
 * @param id - The organization ID to delete.
 * @returns True if the organization was deleted, otherwise false.
 *
 * @example
 * ```ts
 * const deleted = await deleteOrganization("user-uuid", "org-uuid");
 * if (deleted) console.log("Deleted!");
 * ```
 */
export async function deleteOrganization(userId: string, id: string): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const deleted = await deleteOrganizationRepo(id, trx);

    if (deleted) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'organization',
          entity_id: id,
          event_type: 'organization.deleted',
          diff: {},
          context: {},
        },
        trx,
      );
    }

    return deleted;
  });
}
