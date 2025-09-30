import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';

import {
  AuditLog,
  AuditLogSchema,
  CreateAuditLog,
  CreateAuditLogSchema,
} from '@safeoutput/contracts/audit/schema';

function normalizeAuditLog(log: any): any {
  return {
    ...log,
    created_at: log.created_at instanceof Date ? log.created_at.toISOString() : log.created_at,
  };
}

/**
 * Create a new audit log entry.
 *
 * @example
 * ```ts
 * await createAuditLog({
 *   actor_id: "user-uuid",
 *   entity_type: "organization",
 *   entity_id: "org-uuid",
 *   event_type: "organization.updated",
 *   diff: { name: ["Old", "New"] },
 *   context: { ip: "127.0.0.1" },
 * });
 * ```
 *
 * @internal
 */
export async function createAuditLog(input: CreateAuditLog): Promise<AuditLog> {
  const log = await db
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
 * @example
 * ```ts
 * const log = await getAuditLogById("f47ac10b-58cc-4372-a567-0e02b2c3d479");
 * ```
 *
 * @internal
 */
export async function getAuditLogById(id: string): Promise<AuditLog | null> {
  const log = await db.selectFrom('audit_log').selectAll().where('id', '=', id).executeTakeFirst();

  if (!log) return null;
  return AuditLogSchema.parse(normalizeAuditLog(log));
}

/**
 * List audit logs (with pagination).
 *
 * @example
 * ```ts
 * const logs = await listAuditLogs(20, 0);
 * ```
 *
 * @internal
 */
export async function listAuditLogs(limit: number, offset: number): Promise<AuditLog[]> {
  const logs = await db
    .selectFrom('audit_log')
    .selectAll()
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return logs.map((log) => AuditLogSchema.parse(normalizeAuditLog(log)));
}

/**
 * List audit logs for a specific entity.
 *
 * @example
 * ```ts
 * const logs = await listAuditLogsForEntity("organization", "org-uuid", 20, 0);
 * ```
 *
 * @internal
 */
export async function listAuditLogsForEntity(
  entityType: string,
  entityId: string,
  limit: number,
  offset: number,
): Promise<AuditLog[]> {
  const logs = await db
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
 * List audit logs by actor.
 *
 * @example
 * ```ts
 * const logs = await listAuditLogsByActor("user-uuid", 20, 0);
 * ```
 *
 * @internal
 */
export async function listAuditLogsByActor(
  actorId: string,
  limit: number,
  offset: number,
): Promise<AuditLog[]> {
  const logs = await db
    .selectFrom('audit_log')
    .selectAll()
    .where('actor_id', '=', actorId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return logs.map((log) => AuditLogSchema.parse(normalizeAuditLog(log)));
}
