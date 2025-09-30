// src/server/services/organizationMember.service.ts
import {
  OrganizationMember,
  AddMember,
  RemoveMember,
  Organization,
} from '@safeoutput/contracts/organization/schema';

import {
  addOrganizationMember as addOrganizationMemberRepo,
  getOrganizationMember as getOrganizationMemberRepo,
  listOrganizationMembers as listOrganizationMembersRepo,
  listUserOrganizations as listUserOrganizationsRepo,
  removeOrganizationMember as removeOrganizationMemberRepo,
  isUserInOrganization as isUserInOrganizationRepo,
} from '../db/postgres/repo/organizationMember.repo';

import { createAuditLog } from '../db/postgres/repo/audit.repo';
import { db } from '../db/postgres';

/**
 * Service: add a member to an organization and log the event.
 *
 * @param userId - The ID of the actor performing the action.
 * @param organizationId - The ID of the organization.
 * @param data - The member payload (user ID to add).
 * @returns The newly added organization member.
 *
 * @example
 * ```ts
 * const member = await addOrganizationMember("admin-uuid", "org-uuid", {
 *   user_id: "user-uuid",
 * });
 * ```
 */
export async function addOrganizationMember(
  userId: string,
  organizationId: string,
  data: AddMember,
): Promise<OrganizationMember> {
  return db.transaction().execute(async (trx) => {
    const member = await addOrganizationMemberRepo(organizationId, data, trx);

    await createAuditLog(
      {
        actor_id: userId,
        entity_type: 'organization_member',
        entity_id: `${organizationId}:${data.user_id}`,
        event_type: 'organization.member_added',
        diff: { user_id: data.user_id },
        context: { organization_id: organizationId },
      },
      trx,
    );

    return member;
  });
}

/**
 * Service: fetch a member by organization ID and user ID.
 *
 * @param organizationId - The organization ID.
 * @param userId - The user ID.
 * @returns The organization member if found, otherwise null.
 *
 * @example
 * ```ts
 * const member = await getOrganizationMember("org-uuid", "user-uuid");
 * ```
 */
export async function getOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<OrganizationMember | null> {
  return getOrganizationMemberRepo(organizationId, userId);
}

/**
 * Service: list all members of an organization.
 *
 * @param organizationId - The organization ID.
 * @param limit - Maximum number of members to return.
 * @param offset - Number of members to skip before returning results.
 * @returns An array of organization members.
 *
 * @example
 * ```ts
 * const members = await listOrganizationMembers("org-uuid", 20, 0);
 * ```
 */
export async function listOrganizationMembers(
  organizationId: string,
  limit = 50,
  offset = 0,
): Promise<OrganizationMember[]> {
  return listOrganizationMembersRepo(organizationId, limit, offset);
}

/**
 * Service: list all organizations a user belongs to.
 *
 * @param userId - The user ID.
 * @returns An array of organizations.
 *
 * @example
 * ```ts
 * const orgs = await listUserOrganizations("user-uuid");
 * ```
 */
export async function listUserOrganizations(userId: string): Promise<Organization[]> {
  return listUserOrganizationsRepo(userId);
}

/**
 * Service: remove a member from an organization and log the event.
 *
 * @param actorId - The ID of the user performing the removal.
 * @param data - The removal payload (organization ID and user ID).
 * @returns True if the member was removed, otherwise false.
 *
 * @example
 * ```ts
 * const removed = await removeOrganizationMember("admin-uuid", {
 *   organization_id: "org-uuid",
 *   user_id: "user-uuid",
 * });
 * ```
 */
export async function removeOrganizationMember(
  actorId: string,
  data: RemoveMember,
): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const removed = await removeOrganizationMemberRepo(data, trx);

    if (removed) {
      await createAuditLog(
        {
          actor_id: actorId,
          entity_type: 'organization_member',
          entity_id: `${data.organization_id}:${data.user_id}`,
          event_type: 'organization.member_removed',
          diff: { user_id: data.user_id },
          context: { organization_id: data.organization_id },
        },
        trx,
      );
    }

    return removed;
  });
}

/**
 * Service: check if a user is a member of an organization.
 *
 * @param organizationId - The organization ID.
 * @param userId - The user ID.
 * @returns True if the user is in the organization, otherwise false.
 *
 * @example
 * ```ts
 * const isMember = await isUserInOrganization("org-uuid", "user-uuid");
 * ```
 *
 * @deprecated Use Ory Keto for membership checks. If cost efficiency is needed, fallback to this.
 */
export async function isUserInOrganization(
  organizationId: string,
  userId: string,
): Promise<boolean> {
  return isUserInOrganizationRepo(organizationId, userId);
}
