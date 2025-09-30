import { AuditLog, CreateAuditLog } from '@safeoutput/contracts/audit/schema';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../db/types/pg-database-types';

import {
  createAuditLog as createAuditLogRepo,
  getAuditLogById as getAuditLogByIdRepo,
  listAuditLogs as listAuditLogsRepo,
  listAuditLogsForEntity as listAuditLogsForEntityRepo,
  listAuditLogsByActor as listAuditLogsByActorRepo,
} from '../db/postgres/repo/audit.repo';

type Executor = Kysely<DB> | Transaction<DB>;

/**
 * Service: create a new audit log entry.
 *
 * @param data - The audit log data to record.
 * @param executor - Optional Kysely/Transaction executor (for wrapping in a transaction).
 * @returns The created AuditLog entry.
 */
export async function createAuditLog(data: CreateAuditLog, executor?: Executor): Promise<AuditLog> {
  return createAuditLogRepo(data, executor);
}

/**
 * Service: fetch an audit log entry by ID.
 *
 * @param id - The unique audit log ID.
 * @param executor - Optional Kysely/Transaction executor.
 * @returns The AuditLog entry if found, otherwise null.
 */
export async function getAuditLogById(id: string, executor?: Executor): Promise<AuditLog | null> {
  return getAuditLogByIdRepo(id, executor);
}

/**
 * Service: list audit logs with pagination.
 *
 * @param limit - Maximum number of audit logs to return.
 * @param offset - Number of audit logs to skip before returning results.
 * @param executor - Optional Kysely/Transaction executor.
 * @returns An array of AuditLog entries.
 */
export async function listAuditLogs(
  limit = 50,
  offset = 0,
  executor?: Executor,
): Promise<AuditLog[]> {
  return listAuditLogsRepo(limit, offset, executor);
}

/**
 * Service: list audit logs for a specific entity.
 *
 * @param entityType - The entity type (e.g., "organization", "project").
 * @param entityId - The unique ID of the entity.
 * @param limit - Maximum number of audit logs to return.
 * @param offset - Number of audit logs to skip before returning results.
 * @param executor - Optional Kysely/Transaction executor.
 * @returns An array of AuditLog entries.
 */
export async function listAuditLogsForEntity(
  entityType: string,
  entityId: string,
  limit = 50,
  offset = 0,
  executor?: Executor,
): Promise<AuditLog[]> {
  return listAuditLogsForEntityRepo(entityType, entityId, limit, offset, executor);
}

/**
 * Service: list audit logs created by a specific actor.
 *
 * @param actorId - The ID of the actor (e.g., a user).
 * @param limit - Maximum number of audit logs to return.
 * @param offset - Number of audit logs to skip before returning results.
 * @param executor - Optional Kysely/Transaction executor.
 * @returns An array of AuditLog entries.
 */
export async function listAuditLogsByActor(
  actorId: string,
  limit = 50,
  offset = 0,
  executor?: Executor,
): Promise<AuditLog[]> {
  return listAuditLogsByActorRepo(actorId, limit, offset, executor);
}
