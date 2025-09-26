import { db } from '..';
import { randomUUID } from 'crypto';
import type { JsonObject } from '../../types/pg-database-types';

import {
  AuditLog,
  AuditLogSchema,
  CreateAuditLog,
  CreateAuditLogSchema,
} from '@safeoutput/contracts/audit/schema';

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
export async function createAuditLog(data: CreateAuditLog): Promise<AuditLog> {
  CreateAuditLogSchema.parse(data);

  const now = new Date().toISOString();

  const log = await db
    .insertInto('audit_log')
    .values({
      id: randomUUID(),
      actor_id: data.actor_id ?? null,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      event_type: data.event_type,
      diff: data.diff as JsonObject,
      context: (data.context ?? {}) as JsonObject,
      created_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return AuditLogSchema.parse(log);
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

  return log ? AuditLogSchema.parse(log) : null;
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
export async function listAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
  const rows = await db
    .selectFrom('audit_log')
    .selectAll()
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => AuditLogSchema.parse(row));
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
  limit = 50,
  offset = 0,
): Promise<AuditLog[]> {
  const rows = await db
    .selectFrom('audit_log')
    .selectAll()
    .where('entity_type', '=', entityType)
    .where('entity_id', '=', entityId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => AuditLogSchema.parse(row));
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
  limit = 50,
  offset = 0,
): Promise<AuditLog[]> {
  const rows = await db
    .selectFrom('audit_log')
    .selectAll()
    .where('actor_id', '=', actorId)
    .limit(limit)
    .offset(offset)
    .orderBy('created_at', 'desc')
    .execute();

  return rows.map((row) => AuditLogSchema.parse(row));
}
