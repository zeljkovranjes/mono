// src/server/services/organization.service.ts
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

/**
 * Service: create a new organization and assign the creator as the first member.
 *
 * @param userId - The ID of the user who will own the organization.
 * @param data - The organization creation payload.
 * @returns The newly created organization.
 */
export async function createOrganizationWithOwner(
  userId: string,
  data: CreateOrganization,
): Promise<Organization> {
  const org = await createOrganization(data);

  await addOrganizationMember(org.id, { user_id: userId });

  await createAuditLog({
    actor_id: userId,
    entity_type: 'organization',
    entity_id: org.id,
    event_type: 'organization.created',
    diff: {},
    context: {},
  });

  return org;
}

/**
 * Service: fetch an organization by ID.
 *
 * @param id - The unique organization ID.
 * @returns The organization if found, otherwise null.
 */
export async function getOrganization(id: string): Promise<Organization | null> {
  return getOrganizationById(id);
}

/**
 * Service: fetch an organization by slug.
 *
 * @param slug - The unique slug of the organization.
 * @returns The organization if found, otherwise null.
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
 */
export async function updateOrganization(
  userId: string,
  id: string,
  data: UpdateOrganization,
): Promise<Organization | null> {
  const updated = await updateOrganizationRepo(id, data);

  if (updated) {
    await createAuditLog({
      actor_id: userId,
      entity_type: 'organization',
      entity_id: id,
      event_type: 'organization.updated',
      diff: data as Record<string, unknown>,
      context: {},
    });
  }

  return updated;
}

/**
 * Service: delete an organization by ID and log the action.
 *
 * @param userId - The ID of the user performing the deletion.
 * @param id - The organization ID to delete.
 * @returns True if the organization was deleted, otherwise false.
 */
export async function deleteOrganization(userId: string, id: string): Promise<boolean> {
  const deleted = await deleteOrganizationRepo(id);

  if (deleted) {
    await createAuditLog({
      actor_id: userId,
      entity_type: 'organization',
      entity_id: id,
      event_type: 'organization.deleted',
      diff: {},
      context: {},
    });
  }

  return deleted;
}
