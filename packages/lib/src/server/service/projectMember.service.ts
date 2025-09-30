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
import { db } from '../db/postgres';

/**
 * Service: add a member to a project and log an audit entry.
 *
 * @param userId - The user performing the action.
 * @param data - The project member creation payload.
 * @returns The newly added project member.
 *
 * @example
 * ```ts
 * const member = await addProjectMember("user-uuid", {
 *   project_id: "project-uuid",
 *   organization_id: "org-uuid",
 *   user_id: "member-uuid",
 * });
 * ```
 */
export async function addProjectMember(
  userId: string,
  data: CreateProjectMember,
): Promise<ProjectMember> {
  return db.transaction().execute(async (trx) => {
    const member = await addProjectMemberRepo(data, trx);

    await createAuditLog(
      {
        actor_id: userId,
        entity_type: 'project_member',
        entity_id: member.id,
        event_type: 'project_member.added',
        diff: data as Record<string, unknown>,
        context: {},
      },
      trx,
    );

    return member;
  });
}

/**
 * Service: remove a member from a project and log an audit entry.
 *
 * @param userId - The user performing the action.
 * @param data - The project member removal payload.
 * @returns True if removed, otherwise false.
 *
 * @example
 * ```ts
 * const removed = await removeProjectMember("user-uuid", {
 *   project_id: "project-uuid",
 *   user_id: "member-uuid",
 * });
 * ```
 */
export async function removeProjectMember(
  userId: string,
  data: DeleteProjectMember,
): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const removed = await removeProjectMemberRepo(data, trx);

    if (removed) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'project_member',
          entity_id: `${data.project_id}:${data.user_id}`,
          event_type: 'project_member.removed',
          diff: data as Record<string, unknown>,
          context: {},
        },
        trx,
      );
    }

    return removed;
  });
}

/**
 * Service: list all members of a project.
 *
 * @param projectId - The project ID.
 * @returns An array of project members.
 *
 * @example
 * ```ts
 * const members = await listProjectMembers("project-uuid");
 * ```
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
 *
 * @example
 * ```ts
 * const isMember = await isUserInProject("project-uuid", "user-uuid");
 * ```
 */
export async function isUserInProject(projectId: string, userId: string): Promise<boolean> {
  return isUserInProjectRepo(projectId, userId);
}
