import { db } from '..';
import { randomUUID } from 'crypto';
import type { Kysely, Transaction } from 'kysely';
import type { DB } from '../../types/pg-database-types';

import { AuditLog, AuditLogSchema, CreateAuditLog } from '@safeoutput/contracts/audit/schema';

type Executor = Kysely<DB> | Transaction<DB>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAuditLog(log: any): any {
  return {
    ...log,
    created_at: log.created_at instanceof Date ? log.created_at.toISOString() : log.created_at,
  };
}

/**
 * Create a new audit log entry.
 *
 * @internal
 * @param input - The audit log creation payload.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The newly created audit log entry.
 */
export async function createAuditLog(
  input: CreateAuditLog,
  executor: Executor = db,
): Promise<AuditLog> {
  const log = await executor
    .insertInto('audit_log')
    .values({
      id: randomUUID(),
      actor_id: input.actor_id ?? null,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      event_type: input.event_type,
      diff: JSON.stringify(input.diff),
      context: JSON.stringify(input.context ?? {}),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return AuditLogSchema.parse(normalizeAuditLog(log));
}

/**
 * Get an audit log entry by ID.
 *
 * @internal
 * @param id - The audit log ID.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns The audit log if found, otherwise null.
 */
export async function getAuditLogById(
  id: string,
  executor: Executor = db,
): Promise<AuditLog | null> {
  const log = await executor
    .selectFrom('audit_log')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!log) return null;
  return AuditLogSchema.parse(normalizeAuditLog(log));
}

/**
 * List audit logs with pagination.
 *
 * @internal
 * @param limit - Maximum number of logs to return.
 * @param offset - Number of logs to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of audit logs.
 */
export async function listAuditLogs(
  limit: number,
  offset: number,
  executor: Executor = db,
): Promise<AuditLog[]> {
  const logs = await executor
    .selectFrom('audit_log')
    .selectAll()
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return logs.map((log) => AuditLogSchema.parse(normalizeAuditLog(log)));
}

/**
 * List audit logs for a specific entity with pagination.
 *
 * @internal
 * @param entityType - The entity type (e.g., "organization").
 * @param entityId - The entity ID.
 * @param limit - Maximum number of logs to return.
 * @param offset - Number of logs to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of audit logs for the entity.
 */
export async function listAuditLogsForEntity(
  entityType: string,
  entityId: string,
  limit: number,
  offset: number,
  executor: Executor = db,
): Promise<AuditLog[]> {
  const logs = await executor
    .selectFrom('audit_log')
    .selectAll()
    .where('entity_type', '=', entityType)
    .where('entity_id', '=', entityId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return logs.map((log) => AuditLogSchema.parse(normalizeAuditLog(log)));
}

/**
 * List audit logs created by a specific actor with pagination.
 *
 * @internal
 * @param actorId - The actor ID.
 * @param limit - Maximum number of logs to return.
 * @param offset - Number of logs to skip before returning results.
 * @param executor - Optional transaction or database instance (defaults to global db).
 * @returns An array of audit logs by the actor.
 */
export async function listAuditLogsByActor(
  actorId: string,
  limit: number,
  offset: number,
  executor: Executor = db,
): Promise<AuditLog[]> {
  const logs = await executor
    .selectFrom('audit_log')
    .selectAll()
    .where('actor_id', '=', actorId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return logs.map((log) => AuditLogSchema.parse(normalizeAuditLog(log)));
}
