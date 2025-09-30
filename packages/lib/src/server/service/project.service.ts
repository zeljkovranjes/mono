// src/server/services/project.service.ts
import { Project, CreateProject, UpdateProject } from '@safeoutput/contracts/project/schema';

import {
  createProject as createProjectRepo,
  getProjectById as getProjectByIdRepo,
  getOrganizationIdByProject as getOrganizationIdByProjectRepo,
  listProjectsByOrganization as listProjectsByOrganizationRepo,
  updateProject as updateProjectRepo,
  deleteProject as deleteProjectRepo,
} from '../db/postgres/repo/project.repo';

import { createAuditLog } from '../db/postgres/repo/audit.repo';
import { db } from '../db/postgres';

/**
 * Service: create a new project and log an audit entry.
 *
 * @param userId - The ID of the user creating the project.
 * @param data - The project creation payload.
 * @returns The newly created project.
 *
 * @example
 * ```ts
 * const project = await createProject("user-uuid", {
 *   name: "SaaS #1",
 *   organization_id: "org-uuid",
 * });
 * ```
 */
export async function createProject(userId: string, data: CreateProject): Promise<Project> {
  return db.transaction().execute(async (trx) => {
    const project = await createProjectRepo(data, trx);

    await createAuditLog(
      {
        actor_id: userId,
        entity_type: 'project',
        entity_id: project.id,
        event_type: 'project.created',
        diff: data as Record<string, unknown>,
        context: {},
      },
      trx,
    );

    return project;
  });
}

/**
 * Service: fetch a project by ID.
 *
 * @param id - The unique project ID.
 * @returns The project if found, otherwise null.
 *
 * @example
 * ```ts
 * const project = await getProjectById("project-uuid");
 * ```
 */
export async function getProjectById(id: string): Promise<Project | null> {
  return getProjectByIdRepo(id);
}

/**
 * Service: fetch the organization ID for a project.
 *
 * @param projectId - The project ID.
 * @returns The associated organization ID if found, otherwise null.
 *
 * @example
 * ```ts
 * const orgId = await getOrganizationIdByProject("project-uuid");
 * ```
 */
export async function getOrganizationIdByProject(projectId: string): Promise<string | null> {
  return getOrganizationIdByProjectRepo(projectId);
}

/**
 * Service: list projects for an organization with pagination.
 *
 * @param organizationId - The parent organization ID.
 * @param limit - Maximum number of projects to return.
 * @param offset - Number of projects to skip before returning results.
 * @returns An array of projects.
 *
 * @example
 * ```ts
 * const projects = await listProjectsByOrganization("org-uuid", 20, 0);
 * ```
 */
export async function listProjectsByOrganization(
  organizationId: string,
  limit = 50,
  offset = 0,
): Promise<Project[]> {
  return listProjectsByOrganizationRepo(organizationId, limit, offset);
}

/**
 * Service: update a project and log an audit entry.
 *
 * @param userId - The ID of the user performing the update.
 * @param id - The project ID to update.
 * @param data - Partial project update payload.
 * @returns The updated project if found, otherwise null.
 *
 * @example
 * ```ts
 * const updated = await updateProject("user-uuid", "project-uuid", { name: "New Name" });
 * ```
 */
export async function updateProject(
  userId: string,
  id: string,
  data: UpdateProject,
): Promise<Project | null> {
  return db.transaction().execute(async (trx) => {
    const updated = await updateProjectRepo(id, data, trx);

    if (updated) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'project',
          entity_id: id,
          event_type: 'project.updated',
          diff: data as Record<string, unknown>,
          context: {},
        },
        trx,
      );
    }

    return updated;
  });
}

/**
 * Service: delete a project by ID and log the action.
 *
 * @param userId - The ID of the user performing the deletion.
 * @param id - The project ID to delete.
 * @returns True if the project was deleted, otherwise false.
 *
 * @example
 * ```ts
 * const deleted = await deleteProject("user-uuid", "project-uuid");
 * if (deleted) console.log("Deleted!");
 * ```
 */
export async function deleteProject(userId: string, id: string): Promise<boolean> {
  return db.transaction().execute(async (trx) => {
    const deleted = await deleteProjectRepo(id, trx);

    if (deleted) {
      await createAuditLog(
        {
          actor_id: userId,
          entity_type: 'project',
          entity_id: id,
          event_type: 'project.deleted',
          diff: {},
          context: {},
        },
        trx,
      );
    }

    return deleted;
  });
}
