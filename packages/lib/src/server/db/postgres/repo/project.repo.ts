import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';

import {
  Project,
  ProjectSchema,
  CreateProject,
  CreateProjectSchema,
  UpdateProject,
  UpdateProjectSchema,
} from '@safeoutput/contracts/project/schema';

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
 * @example
 * ```ts
 * const project = await createProject({
 *   name: "SaaS #1",
 *   organization_id: "org-uuid",
 * });
 * ```
 *
 * @internal
 */
export async function createProject(data: CreateProject): Promise<Project> {
  CreateProjectSchema.parse(data);

  const now = new Date().toISOString();

  const newProject = await db
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
 * @example
 * ```ts
 * const project = await getProjectById("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * ```
 *
 * @internal
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const project = await db
    .selectFrom('project')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  return project ? ProjectSchema.parse(normalizeProject(project)) : null;
}
/**
 * Get the organization ID for a given project.
 *
 * @example
 * ```ts
 * const orgId = await getOrganizationIdByProject("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * if (orgId) {
 *   console.log("Organization:", orgId);
 * }
 * ```
 *
 * @internal
 */
export async function getOrganizationIdByProject(projectId: string): Promise<string | null> {
  const row = await db
    .selectFrom('project')
    .select('organization_id')
    .where('id', '=', projectId)
    .executeTakeFirst();

  return row?.organization_id ?? null;
}

/**
 * List projects for an organization (with pagination).
 *
 * @example
 * ```ts
 * const projects = await listProjectsByOrganization("org-uuid", 20, 0);
 * ```
 *
 * @internal
 */
export async function listProjectsByOrganization(
  organizationId: string,
  limit = 50,
  offset = 0,
): Promise<Project[]> {
  const rows = await db
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
 * @example
 * ```ts
 * const updated = await updateProject("f47ac10b-58cc-4372-a567-0e02b2c3d479", {
 *   name: "New Project Name",
 * });
 * ```
 *
 * @internal
 */
export async function updateProject(id: string, data: UpdateProject): Promise<Project | null> {
  UpdateProjectSchema.parse(data);

  const updated = await db
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
 * @example
 * ```ts
 * const deleted = await deleteProject("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * if (deleted) console.log("Deleted!");
 * ```
 *
 * @internal
 */
export async function deleteProject(id: string): Promise<boolean> {
  const res = await db.deleteFrom('project').where('id', '=', id).executeTakeFirst();

  return (res.numDeletedRows ?? 0) > 0;
}
