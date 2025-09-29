import {
  ProjectMember,
  CreateProjectMember,
  DeleteProjectMember,
} from '@safeoutput/contracts/project/schema';

import {
  addProjectMember as addProjectMemberRepo,
  removeProjectMember as removeProjectMemberRepo,
  listProjectMembers as listProjectMembersRepo,
  isUserInProject as isUserInProjectRepo,
} from '../db/postgres/repo/projectMember.repo';

import { createAuditLog } from '../db/postgres/repo/audit.repo';

/**
 * Service: add a member to a project and log an audit entry.
 *
 * @param userId - The user performing the action.
 * @param data - The project member creation payload.
 * @returns The newly added project member.
 */
export async function addProjectMember(
  userId: string,
  data: CreateProjectMember,
): Promise<ProjectMember> {
  const member = await addProjectMemberRepo(data);

  await createAuditLog({
    actor_id: userId,
    entity_type: 'project_member',
    entity_id: member.id,
    event_type: 'project_member.added',
    diff: data as Record<string, unknown>,
    context: {},
  });

  return member;
}

/**
 * Service: remove a member from a project and log an audit entry.
 *
 * @param userId - The user performing the action.
 * @param data - The project member removal payload.
 * @returns True if removed, otherwise false.
 */
export async function removeProjectMember(
  userId: string,
  data: DeleteProjectMember,
): Promise<boolean> {
  const removed = await removeProjectMemberRepo(data);

  if (removed) {
    await createAuditLog({
      actor_id: userId,
      entity_type: 'project_member',
      entity_id: `${data.project_id}:${data.user_id}`,
      event_type: 'project_member.removed',
      diff: data as Record<string, unknown>,
      context: {},
    });
  }

  return removed;
}

/**
 * Service: list all members of a project.
 *
 * @param projectId - The project ID.
 * @returns An array of project members.
 */
export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  return listProjectMembersRepo(projectId);
}

/**
 * Service: check if a user is a member of a project.
 *
 * @param projectId - The project ID.
 * @param userId - The user ID.
 * @returns True if the user is a member, otherwise false.
 */
export async function isUserInProject(projectId: string, userId: string): Promise<boolean> {
  return isUserInProjectRepo(projectId, userId);
}
