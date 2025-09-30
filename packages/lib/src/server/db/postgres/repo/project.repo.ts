import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

import {
  Project,
  ProjectSchema,
  CreateProject,
  CreateProjectSchema,
  UpdateProject,
  UpdateProjectSchema,
} from '@safeoutput/contracts/project/schema';

type Executor = Kysely<DB> | Transaction<DB>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProject(row: any): Project {
  return {
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

/**
 * Create a new project.
 *
 * @internal
 * @param data - The project creation payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly created project.
 */
export async function createProject(
  data: CreateProject,
  executor: Executor = db,
): Promise<Project> {
  CreateProjectSchema.parse(data);

  const now = new Date().toISOString();

  const newProject = await executor
    .insertInto('project')
    .values({
      id: randomUUID(),
      name: data.name,
      organization_id: data.organization_id,
      metadata: (data.metadata ?? {}) as JsonObject,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return ProjectSchema.parse(normalizeProject(newProject));
}

/**
 * Get a project by ID.
 *
 * @internal
 * @param id - The project ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The project if found, otherwise null.
 */
export async function getProjectById(id: string, executor: Executor = db): Promise<Project | null> {
  const project = await executor
    .selectFrom('project')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return project ? ProjectSchema.parse(normalizeProject(project)) : null;
}

/**
 * Get the organization ID for a given project.
 *
 * @internal
 * @param projectId - The project ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The organization ID if found, otherwise null.
 */
export async function getOrganizationIdByProject(
  projectId: string,
  executor: Executor = db,
): Promise<string | null> {
  const row = await executor
    .selectFrom('project')
    .select('organization_id')
    .where('id', '=', projectId)
    .executeTakeFirst();

  return row?.organization_id ?? null;
}

/**
 * List projects for an organization (with pagination).
 *
 * @internal
 * @param organizationId - The organization ID.
 * @param limit - Maximum number of projects to return.
 * @param offset - Number of projects to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of projects.
 */
export async function listProjectsByOrganization(
  organizationId: string,
  limit = 50,
  offset = 0,
  executor: Executor = db,
): Promise<Project[]> {
  const rows = await executor
    .selectFrom('project')
    .selectAll()
    .where('organization_id', '=', organizationId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => ProjectSchema.parse(normalizeProject(row)));
}

/**
 * Update a project.
 *
 * @internal
 * @param id - The project ID.
 * @param data - Partial update payload for the project.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The updated project if found, otherwise null.
 */
export async function updateProject(
  id: string,
  data: UpdateProject,
  executor: Executor = db,
): Promise<Project | null> {
  UpdateProjectSchema.parse(data);

  const updated = await executor
    .updateTable('project')
    .set({
      ...(data.name && { name: data.name }),
      ...(data.metadata && { metadata: data.metadata as JsonObject }),
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  return updated ? ProjectSchema.parse(normalizeProject(updated)) : null;
}

/**
 * Delete a project by ID.
 *
 * @internal
 * @param id - The project ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns True if the project was deleted, otherwise false.
 */
export async function deleteProject(id: string, executor: Executor = db): Promise<boolean> {
  const res = await executor.deleteFrom('project').where('id', '=', id).executeTakeFirst();
  return (res.numDeletedRows ?? 0) > 0;
}
