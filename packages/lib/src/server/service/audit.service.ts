import { AuditLog, CreateAuditLog } from '@safeoutput/contracts/audit/schema';

import {
  createAuditLog as createAuditLogRepo,
  getAuditLogById as getAuditLogByIdRepo,
  listAuditLogs as listAuditLogsRepo,
  listAuditLogsForEntity as listAuditLogsForEntityRepo,
  listAuditLogsByActor as listAuditLogsByActorRepo,
} from '../db/postgres/repo/audit.repo';

/**
 * Service: create a new audit log entry.
 *
 * @param data - The audit log data to record.
 * @returns The created AuditLog entry.
 *
 * @example
 * ```ts
 * const log = await createAuditLog({
 *   actor_id: "user-uuid",
 *   entity_type: "organization",
 *   entity_id: "org-uuid",
 *   event_type: "organization.updated",
 *   diff: { name: ["Old", "New"] },
 *   context: { ip: "127.0.0.1" },
 * });
 * ```
 */
export async function createAuditLog(data: CreateAuditLog): Promise<AuditLog> {
  return createAuditLogRepo(data);
}

/**
 * Service: fetch an audit log entry by ID.
 *
 * @param id - The unique audit log ID.
 * @returns The AuditLog entry if found, otherwise null.
 */
export async function getAuditLogById(id: string): Promise<AuditLog | null> {
  return getAuditLogByIdRepo(id);
}

/**
 * Service: list audit logs with pagination.
 *
 * @param limit - Maximum number of audit logs to return.
 * @param offset - Number of audit logs to skip before returning results.
 * @returns An array of AuditLog entries.
 */
export async function listAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
  return listAuditLogsRepo(limit, offset);
}

/**
 * Service: list audit logs for a specific entity.
 *
 * @param entityType - The entity type (e.g., "organization", "project").
 * @param entityId - The unique ID of the entity.
 * @param limit - Maximum number of audit logs to return.
 * @param offset - Number of audit logs to skip before returning results.
 * @returns An array of AuditLog entries.
 */
export async function listAuditLogsForEntity(
  entityType: string,
  entityId: string,
  limit = 50,
  offset = 0,
): Promise<AuditLog[]> {
  return listAuditLogsForEntityRepo(entityType, entityId, limit, offset);
}

/**
 * Service: list audit logs created by a specific actor.
 *
 * @param actorId - The ID of the actor (e.g., a user).
 * @param limit - Maximum number of audit logs to return.
 * @param offset - Number of audit logs to skip before returning results.
 * @returns An array of AuditLog entries.
 */
export async function listAuditLogsByActor(
  actorId: string,
  limit = 50,
  offset = 0,
): Promise<AuditLog[]> {
  return listAuditLogsByActorRepo(actorId, limit, offset);
}
