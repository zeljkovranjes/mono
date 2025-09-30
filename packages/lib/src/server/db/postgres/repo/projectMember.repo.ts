import { db } from '..';
import { randomUUID } from 'crypto';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

import {
  ProjectMember,
  ProjectMemberSchema,
  CreateProjectMember,
  DeleteProjectMember,
  CreateProjectMemberSchema,
  DeleteProjectMemberSchema,
} from '@safeoutput/contracts/project/schema';

type Executor = Kysely<DB> | Transaction<DB>;

/**
 * Add a member to a project.
 *
 * @internal
 * @param data - The new project member payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly created project member.
 *
 * @example
 * ```ts
 * const member = await addProjectMember({
 *   project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *   organization_id: "123e4567-e89b-12d3-a456-426614174000",
 *   user_id: "d2719c3c-5d55-4f2b-84dd-fbb90d0c7b4a",
 * });
 * ```
 */
export async function addProjectMember(
  data: CreateProjectMember,
  executor: Executor = db,
): Promise<ProjectMember> {
  const validated = CreateProjectMemberSchema.parse(data);

  const row = await executor
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
 * @internal
 * @param data - The project member removal payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the member was removed, otherwise false.
 *
 * @example
 * ```ts
 * const removed = await removeProjectMember({
 *   project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *   user_id: "d2719c3c-5d55-4f2b-84dd-fbb90d0c7b4a",
 * });
 * ```
 */
export async function removeProjectMember(
  data: DeleteProjectMember,
  executor: Executor = db,
): Promise<boolean> {
  const validated = DeleteProjectMemberSchema.parse(data);

  const res = await executor
    .deleteFrom('project_member')
    .where('project_id', '=', validated.project_id)
    .where('user_id', '=', validated.user_id)
    .executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}

/**
 * List all members of a project.
 *
 * @internal
 * @param projectId - The project ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of project members.
 *
 * @example
 * ```ts
 * const members = await listProjectMembers("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * ```
 */
export async function listProjectMembers(
  projectId: string,
  executor: Executor = db,
): Promise<ProjectMember[]> {
  const rows = await executor
    .selectFrom('project_member')
    .selectAll()
    .where('project_id', '=', projectId)
    .execute();

  return rows.map((row) => ProjectMemberSchema.parse(row));
}

/**
 * Check if a user is a member of a project.
 *
 * @internal
 * @param projectId - The project ID.
 * @param userId - The user ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the user is a member of the project, otherwise false.
 *
 * @example
 * ```ts
 * const isMember = await isUserInProject(
 *   "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *   "d2719c3c-5d55-4f2b-84dd-fbb90d0c7b4a"
 * );
 * ```
 */
export async function isUserInProject(
  projectId: string,
  userId: string,
  executor: Executor = db,
): Promise<boolean> {
  const row = await executor
    .selectFrom('project_member')
    .select('id')
    .where('project_id', '=', projectId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return !!row;
}
