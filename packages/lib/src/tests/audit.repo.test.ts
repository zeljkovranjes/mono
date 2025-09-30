// src/tests/audit.repo.test.ts
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/audit.repo';

// helper: ensure created_at is always a string
function normalize<T extends { created_at?: any }>(row: T | null): T | null {
  if (row && row.created_at instanceof Date) {
    return { ...row, created_at: row.created_at.toISOString() } as T;
  }
  return row;
}

describe('audit.repo (pg-mem integration tests)', () => {
  beforeAll(async () => {
    try {
      await db.schema.dropTable('audit_log').execute();
    } catch {}

    await db.schema
      .createTable('audit_log')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('actor_id', 'uuid')
      .addColumn('entity_type', 'varchar(255)', (c) => c.notNull())
      .addColumn('entity_id', 'uuid', (c) => c.notNull())
      .addColumn('event_type', 'varchar(255)', (c) => c.notNull())
      .addColumn('diff', 'jsonb', (c) => c.notNull())
      .addColumn('context', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamptz', (c) => c.defaultTo(new Date().toISOString()))
      .execute();
  });

  beforeEach(async () => {
    await db.deleteFrom('audit_log').execute();
  });

  it('creates an audit log entry', async () => {
    const log = await repo.createAuditLog({
      actor_id: randomUUID(),
      entity_type: 'organization',
      entity_id: randomUUID(),
      event_type: 'organization.created',
      diff: { name: 'Acme' },
      context: { ip: '127.0.0.1' },
    });

    const normalized = normalize(log);

    expect(normalized?.id).toBeDefined();
    expect(normalized?.entity_type).toBe('organization');
    expect(typeof normalized?.created_at).toBe('string');
  });

  it('fetches audit log by id', async () => {
    const created = await repo.createAuditLog({
      entity_type: 'organization',
      entity_id: randomUUID(),
      event_type: 'organization.updated',
      diff: { name: 'New Name' },
      context: {},
    });

    const found = normalize(await repo.getAuditLogById(created.id));
    expect(found?.id).toBe(created.id);
  });

  it('returns null when id not found', async () => {
    const found = await repo.getAuditLogById(randomUUID());
    expect(found).toBeNull();
  });

  it('lists audit logs with pagination', async () => {
    await repo.createAuditLog({
      entity_type: 'org',
      entity_id: randomUUID(),
      event_type: 'created',
      diff: {},
      context: {},
    });
    await repo.createAuditLog({
      entity_type: 'org',
      entity_id: randomUUID(),
      event_type: 'updated',
      diff: {},
      context: {},
    });

    const list = (await repo.listAuditLogs(10, 0)).map(normalize);
    expect(list.length).toBe(2);
    expect(typeof list[0]?.created_at).toBe('string');
  });

  it('lists audit logs for entity', async () => {
    const entityId = randomUUID();

    await repo.createAuditLog({
      entity_type: 'org',
      entity_id: entityId,
      event_type: 'created',
      diff: {},
      context: {},
    });

    const list = (await repo.listAuditLogsForEntity('org', entityId, 10, 0)).map(normalize);
    expect(list.length).toBe(1);
    expect(list[0]?.entity_id).toBe(entityId);
  });

  it('lists audit logs by actor', async () => {
    const actorId = randomUUID();

    await repo.createAuditLog({
      actor_id: actorId,
      entity_type: 'org',
      entity_id: randomUUID(),
      event_type: 'viewed',
      diff: {},
      context: {},
    });

    const list = (await repo.listAuditLogsByActor(actorId, 10, 0)).map(normalize);
    expect(list.length).toBe(1);
    expect(list[0]?.actor_id).toBe(actorId);
  });
});
