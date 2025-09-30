// src/tests/organization.repo.test.ts
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/organization.repo';
import { randomUUID } from 'crypto';

describe('organization.repo (pg-mem integration tests)', () => {
  beforeAll(async () => {
    try {
      await db.schema.dropTable('organization').execute();
    } catch {}

    await db.schema
      .createTable('organization')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar', (c) => c.notNull())
      .addColumn('slug', 'varchar', (c) => c.notNull())
      .addColumn('type', 'varchar', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('subscription_status', 'varchar')
      .addColumn('current_plan_id', 'uuid')
      .addColumn('created_at', 'timestamptz', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamptz', (c) => c.defaultTo(new Date().toISOString()))
      .execute();
  });

  beforeEach(async () => {
    await db.deleteFrom('organization').execute();
  });

  it('creates an organization', async () => {
    const org = await repo.createOrganization({
      name: 'Acme',
      slug: 'acme',
      type: 'Startup',
      metadata: {},
    });

    expect(org.id).toBeDefined();
    expect(org.name).toBe('Acme');

    const rows = await db.selectFrom('organization').selectAll().execute();
    expect(rows).toHaveLength(1);
  });

  it('fetches organization by id', async () => {
    const created = await repo.createOrganization({
      name: 'Beta',
      slug: 'beta',
      type: 'Agency',
      metadata: {},
    });

    const found = await repo.getOrganizationById(created.id);
    expect(found?.name).toBe('Beta');
  });

  it('returns null when org id not found', async () => {
    const found = await repo.getOrganizationById(randomUUID());
    expect(found).toBeNull();
  });

  it('fetches organization by slug', async () => {
    const created = await repo.createOrganization({
      name: 'Gamma',
      slug: 'gamma',
      type: 'Startup',
      metadata: {},
    });

    const found = await repo.getOrganizationBySlug('gamma');
    expect(found?.id).toBe(created.id);
  });

  it('lists organizations with pagination', async () => {
    await repo.createOrganization({ name: 'One', slug: 'one', type: 'Startup', metadata: {} });
    await repo.createOrganization({ name: 'Two', slug: 'two', type: 'Agency', metadata: {} });

    const list = await repo.listOrganizations(10, 0);
    expect(list.length).toBe(2);
  });

  it('lists organizations by type', async () => {
    await repo.createOrganization({
      name: 'OnlyStartup',
      slug: 'only-startup',
      type: 'Startup',
      metadata: {},
    });
    await repo.createOrganization({
      name: 'OnlyAgency',
      slug: 'only-agency',
      type: 'Agency',
      metadata: {},
    });

    const startups = await repo.listOrganizationsByType('Startup', 10, 0);
    expect(startups.length).toBe(1);
    expect(startups[0]!.type).toBe('Startup');
  });

  it('updates organization fields', async () => {
    const created = await repo.createOrganization({
      name: 'OldName',
      slug: 'old-slug',
      type: 'Startup',
      metadata: {},
    });

    const updated = await repo.updateOrganization(created.id, {
      name: 'NewName',
      slug: 'new-slug',
    });

    expect(updated?.name).toBe('NewName');
    expect(updated?.slug).toBe('new-slug');
  });

  it('returns null if update not found', async () => {
    const updated = await repo.updateOrganization(randomUUID(), { name: 'Nope' });
    expect(updated).toBeNull();
  });

  it('deletes organization', async () => {
    const created = await repo.createOrganization({
      name: 'DeleteMe',
      slug: 'deleteme',
      type: 'Startup',
      metadata: {},
    });

    const deleted = await repo.deleteOrganization(created.id);
    expect(deleted).toBe(true);

    const after = await repo.getOrganizationById(created.id);
    expect(after).toBeNull();
  });

  it('returns false when delete fails', async () => {
    const deleted = await repo.deleteOrganization(randomUUID());
    expect(deleted).toBe(false);
  });
});
