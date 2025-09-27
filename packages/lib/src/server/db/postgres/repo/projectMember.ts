import { db } from '..';
import { randomUUID } from 'crypto';
import { JsonObject } from '../../types/pg-database-types';
import {
  ProjectMember,
  ProjectMemberSchema,
  CreateProjectMember,
  DeleteProjectMember,
  CreateProjectMemberSchema,
  DeleteProjectMemberSchema,
} from '@safeoutput/contracts/project/schema';

/**
 * Add a member to a project.
 *
 * @example
 * ```ts
 * const member = await addProjectMember({
 *   project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *   organization_id: "123e4567-e89b-12d3-a456-426614174000",
 *   user_id: "d2719c3c-5d55-4f2b-84dd-fbb90d0c7b4a",
 * });
 * ```
 *
 * @internal
 */
export async function addProjectMember(data: CreateProjectMember): Promise<ProjectMember> {
  const validated = CreateProjectMemberSchema.parse(data);

  const row = await db
    .insertInto('project_member')
    .values({
      id: randomUUID(),
      project_id: validated.project_id,
      user_id: validated.user_id,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return ProjectMemberSchema.parse(row);
}

/**
 * Remove a member from a project.
 *
 * @example
 * ```ts
 * const removed = await removeProjectMember({
 *   project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *   user_id: "d2719c3c-5d55-4f2b-84dd-fbb90d0c7b4a",
 * });
 * ```
 *
 * @internal
 */
export async function removeProjectMember(data: DeleteProjectMember): Promise<boolean> {
  const validated = DeleteProjectMemberSchema.parse(data);

  const res = await db
    .deleteFrom('project_member')
    .where('project_id', '=', validated.project_id)
    .where('user_id', '=', validated.user_id)
    .executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}

/**
 * List all members of a project.
 *
 * @example
 * ```ts
 * const members = await listProjectMembers("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * ```
 *
 * @internal
 */
export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const rows = await db
    .selectFrom('project_member')
    .selectAll()
    .where('project_id', '=', projectId)
    .execute();

  return rows.map((row) => ProjectMemberSchema.parse(row));
}

/**
 * Check if a user is a member of a project.
 *
 * @example
 * ```ts
 * const isMember = await isUserInProject("f47ac10b-58cc-4372-a567-0e02b2c3d479", "d2719c3c-5d55-4f2b-84dd-fbb90d0c7b4a");
 * ```
 *
 * @internal
 */
export async function isUserInProject(projectId: string, userId: string): Promise<boolean> {
  const row = await db
    .selectFrom('project_member')
    .select('id')
    .where('project_id', '=', projectId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return !!row;
}
