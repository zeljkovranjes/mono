import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';

import {
  OrganizationMember,
  OrganizationMemberSchema,
  AddMember,
  AddMemberSchema,
  RemoveMember,
  RemoveMemberSchema,
  Organization,
  OrganizationSchema,
} from '@safeoutput/contracts/organization/schema';

/**
 * Add a member to an organization.
 *
 * @example
 * ```ts
 * const member = await addOrganizationMember("org-id-uuid", {
 *   user_id: "user-id-uuid",
 * });
 * ```
 *
 * @internal
 */
export async function addOrganizationMember(
  organizationId: string,
  data: AddMember,
): Promise<OrganizationMember> {
  // Ensure valid input
  AddMemberSchema.parse(data);

  const now = new Date().toISOString();

  const newMember = await db
    .insertInto('organization_member')
    .values({
      organization_id: organizationId,
      user_id: data.user_id,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return OrganizationMemberSchema.parse(newMember);
}

/**
 * Get a member record by organization and user ID.
 *
 * @example
 * ```ts
 * const member = await getOrganizationMember("org-id-uuid", "user-id-uuid");
 * ```
 *
 * @internal
 */
export async function getOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<OrganizationMember | null> {
  const member = await db
    .selectFrom('organization_member')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return member ? OrganizationMemberSchema.parse(member) : null;
}

/**
 * List members of an organization.
 *
 * @example
 * ```ts
 * const members = await listOrganizationMembers("org-id-uuid");
 * ```
 *
 * @internal
 */
export async function listOrganizationMembers(
  organizationId: string,
  limit = 50,
  offset = 0,
): Promise<OrganizationMember[]> {
  const rows = await db
    .selectFrom('organization_member')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'asc')
    .execute();

  return rows.map((row) => OrganizationMemberSchema.parse(row));
}

/**
 * List all organizations that a user belongs to.
 *
 * @example
 * ```ts
 * const orgs = await listUserOrganizations("user-id-uuid");
 * ```
 *
 * @internal
 */
export async function listUserOrganizations(userId: string): Promise<Organization[]> {
  const rows = await db
    .selectFrom('organization_member')
    .innerJoin('organization', 'organization.id', 'organization_member.organization_id')
    .selectAll('organization')
    .where('organization_member.user_id', '=', userId)
    .orderBy('organization.created_at', 'desc')
    .execute();

  return rows.map((row) => OrganizationSchema.parse(row));
}

/**
 * Remove a member from an organization.
 *
 * @example
 * ```ts
 * const removed = await removeOrganizationMember({
 *   organization_id: "org-id-uuid",
 *   user_id: "user-id-uuid",
 * });
 * if (removed) console.log("Removed successfully");
 * ```
 *
 * @internal
 */
export async function removeOrganizationMember(data: RemoveMember): Promise<boolean> {
  RemoveMemberSchema.parse(data);

  const res = await db
    .deleteFrom('organization_member')
    .where('organization_id', '=', data.organization_id)
    .where('user_id', '=', data.user_id)
    .executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}

/**
 * Check if a user is a member of an organization.
 *
 * @example
 * ```ts
 * const isMember = await isUserInOrganization("org-id-uuid", "user-id-uuid");
 * ```
 *
 * @internal
 *
 * @deprecated use ory keto to check. if you are being cost efficient then use below.
 */
export async function isUserInOrganization(
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const res = await db
    .selectFrom('organization_member')
    .select('user_id')
    .where('organization_id', '=', organizationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return !!res;
}
