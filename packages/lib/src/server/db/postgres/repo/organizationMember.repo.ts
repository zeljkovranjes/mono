import { db } from '..';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

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

type Executor = Kysely<DB> | Transaction<DB>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMember(member: any): any {
  return {
    ...member,
    created_at:
      member.created_at instanceof Date ? member.created_at.toISOString() : member.created_at,
    updated_at:
      member.updated_at instanceof Date ? member.updated_at.toISOString() : member.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOrg(org: any): any {
  return {
    ...org,
    subscription_status: org.subscription_status ?? null,
    current_plan_id: org.current_plan_id ?? null,
    created_at: org.created_at instanceof Date ? org.created_at.toISOString() : org.created_at,
    updated_at: org.updated_at instanceof Date ? org.updated_at.toISOString() : org.updated_at,
  };
}

/**
 * Add a member to an organization.
 *
 * @internal
 * @param organizationId - The organization ID.
 * @param data - The member payload to add.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly added organization member.
 */
export async function addOrganizationMember(
  organizationId: string,
  data: AddMember,
  executor: Executor = db,
): Promise<OrganizationMember> {
  AddMemberSchema.parse(data);

  const now = new Date().toISOString();

  const newMember = await executor
    .insertInto('organization_member')
    .values({
      organization_id: organizationId,
      user_id: data.user_id,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return OrganizationMemberSchema.parse(normalizeMember(newMember));
}

/**
 * Get a member record by organization and user ID.
 *
 * @internal
 * @param organizationId - The organization ID.
 * @param userId - The user ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The organization member if found, otherwise null.
 */
export async function getOrganizationMember(
  organizationId: string,
  userId: string,
  executor: Executor = db,
): Promise<OrganizationMember | null> {
  const member = await executor
    .selectFrom('organization_member')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return member ? OrganizationMemberSchema.parse(normalizeMember(member)) : null;
}

/**
 * List members of an organization.
 *
 * @internal
 * @param organizationId - The organization ID.
 * @param limit - Maximum number of members to return.
 * @param offset - Number of members to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of organization members.
 */
export async function listOrganizationMembers(
  organizationId: string,
  limit = 50,
  offset = 0,
  executor: Executor = db,
): Promise<OrganizationMember[]> {
  const rows = await executor
    .selectFrom('organization_member')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'asc')
    .execute();

  return rows.map((row) => OrganizationMemberSchema.parse(normalizeMember(row)));
}

/**
 * List all organizations that a user belongs to.
 *
 * @internal
 * @param userId - The user ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of organizations.
 */
export async function listUserOrganizations(
  userId: string,
  executor: Executor = db,
): Promise<Organization[]> {
  const rows = await executor
    .selectFrom('organization_member')
    .innerJoin('organization', 'organization.id', 'organization_member.organization_id')
    .selectAll('organization')
    .where('organization_member.user_id', '=', userId)
    .orderBy('organization.created_at', 'desc')
    .execute();

  return rows.map((row) => OrganizationSchema.parse(normalizeOrg(row)));
}

/**
 * Remove a member from an organization.
 *
 * @internal
 * @param data - The removal payload (organization_id + user_id).
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the member was removed, otherwise false.
 */
export async function removeOrganizationMember(
  data: RemoveMember,
  executor: Executor = db,
): Promise<boolean> {
  RemoveMemberSchema.parse(data);

  const res = await executor
    .deleteFrom('organization_member')
    .where('organization_id', '=', data.organization_id)
    .where('user_id', '=', data.user_id)
    .executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}

/**
 * Check if a user is a member of an organization.
 *
 * @internal
 * @param organizationId - The organization ID.
 * @param userId - The user ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the user is a member of the organization, otherwise false.
 *
 * @deprecated Use Ory Keto for membership checks.
 * If cost efficiency is a concern, this direct query can be used instead.
 */
export async function isUserInOrganization(
  organizationId: string,
  userId: string,
  executor: Executor = db,
): Promise<boolean> {
  const res = await executor
    .selectFrom('organization_member')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return !!res;
}
