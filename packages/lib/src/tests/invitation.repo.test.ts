// src/tests/invitation.repo.test.ts
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/invitation.repo';

describe('invitation.repo (pg-mem integration tests)', () => {
  let testOrgId: string;
  let testProjectId: string;

  beforeAll(async () => {
    try {
      await db.schema.dropTable('invitation').execute();
    } catch {}
    try {
      await db.schema.dropTable('project').execute();
    } catch {}
    try {
      await db.schema.dropTable('organization').execute();
    } catch {}

    await db.schema
      .createTable('organization')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar(255)', (c) => c.notNull())
      .addColumn('slug', 'varchar(255)', (c) => c.notNull().unique())
      .addColumn('type', 'varchar(255)', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('stripe_customer_id', 'varchar(255)')
      .addColumn('stripe_subscription_status', 'varchar(255)')
      .addColumn('current_plan_id', 'uuid')
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    await db.schema
      .createTable('project')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar(255)', (c) => c.notNull())
      .addColumn('organization_id', 'uuid', (c) => c.notNull().references('organization.id'))
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    await db.schema
      .createTable('invitation')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('scope', 'varchar(32)', (c) => c.notNull())
      .addColumn('organization_id', 'uuid', (c) => c.references('organization.id'))
      .addColumn('project_id', 'uuid', (c) => c.references('project.id'))
      .addColumn('inviter_user_id', 'uuid', (c) => c.notNull())
      .addColumn('invitee_email', 'varchar(320)', (c) => c.notNull())
      .addColumn('invitee_user_id', 'uuid')
      .addColumn('role', 'varchar(64)')
      .addColumn('token', 'varchar(255)', (c) => c.notNull().unique())
      .addColumn('status', 'varchar(32)', (c) => c.notNull().defaultTo('pending'))
      .addColumn('expires_at', 'timestamp')
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    testOrgId = randomUUID();
    await db
      .insertInto('organization')
      .values({
        id: testOrgId,
        name: 'Test Org',
        slug: 'test-org',
        type: 'Startup',
        metadata: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    testProjectId = randomUUID();
    await db
      .insertInto('project')
      .values({
        id: testProjectId,
        organization_id: testOrgId,
        name: 'Test Project',
        metadata: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();
  });

  beforeEach(async () => {
    await db.deleteFrom('invitation').execute();
  });

  // ... other tests unchanged ...

  describe('listInvitationsByOrganization', () => {
    it('respects pagination offset', async () => {
      const createdIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const inv = await repo.createInvitation({
          scope: 'organization',
          organization_id: testOrgId,
          inviter_user_id: randomUUID(),
          invitee_email: `offset${i}@example.com`,
          token: `token-offset-${i}-long`,
          status: 'pending',
          metadata: {},
        });
        createdIds.push(inv.id);
      }

      const firstPage = await repo.listInvitationsByOrganization(testOrgId, 2, 0);
      const secondPage = await repo.listInvitationsByOrganization(testOrgId, 2, 2);

      expect(firstPage.length).toBe(2);
      expect(secondPage.length).toBe(1);
      expect(firstPage.map((i) => i.id)).not.toContain(secondPage[0]?.id);
    });
  });

  describe('listInvitationsByProject', () => {
    it('lists invitations for project', async () => {
      await repo.createInvitation({
        scope: 'project',
        project_id: testProjectId,
        inviter_user_id: randomUUID(),
        invitee_email: 'proj1@example.com',
        token: 'token-proj-123456789',
        status: 'pending',
        metadata: {},
      });

      await repo.createInvitation({
        scope: 'project',
        project_id: testProjectId,
        inviter_user_id: randomUUID(),
        invitee_email: 'proj2@example.com',
        token: 'token-proj-223456789',
        status: 'pending',
        metadata: {},
      });

      const invitations = await repo.listInvitationsByProject(testProjectId, 10, 0);
      expect(invitations.length).toBe(2);
      expect(invitations.every((inv) => inv.project_id === testProjectId)).toBe(true);
    });
  });
});
