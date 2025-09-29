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

/**
 * Service: add a member to an organization.
 *
 * @param organizationId - The ID of the organization.
 * @param data - The member payload (user ID).
 * @returns The newly added organization member.
 */
export async function addOrganizationMember(
  organizationId: string,
  data: AddMember,
): Promise<OrganizationMember> {
  return addOrganizationMemberRepo(organizationId, data);
}

/**
 * Service: fetch a member by organization ID and user ID.
 *
 * @param organizationId - The organization ID.
 * @param userId - The user ID.
 * @returns The organization member if found, otherwise null.
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
 */
export async function listUserOrganizations(userId: string): Promise<Organization[]> {
  return listUserOrganizationsRepo(userId);
}

/**
 * Service: remove a member from an organization.
 *
 * @param data - The removal payload (organization ID and user ID).
 * @returns True if the member was removed, otherwise false.
 */
export async function removeOrganizationMember(data: RemoveMember): Promise<boolean> {
  return removeOrganizationMemberRepo(data);
}

/**
 * Service: check if a user is a member of an organization.
 *
 * @param organizationId - The organization ID.
 * @param userId - The user ID.
 * @returns True if the user is in the organization, otherwise false.
 *
 * @deprecated Use Ory Keto for membership checks. If cost efficiency is needed, fallback to this.
 */
export async function isUserInOrganization(
  organizationId: string,
  userId: string,
): Promise<boolean> {
  return isUserInOrganizationRepo(organizationId, userId);
}
