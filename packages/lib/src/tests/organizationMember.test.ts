import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/organizationMember.repo';

describe('organizationMember.repo (pg-mem integration tests)', () => {
  let orgId: string;
  let orgId2: string;
  let userId: string;

  beforeAll(async () => {
    // drop in order (FKs)
    try {
      await db.schema.dropTable('organization_member').execute();
    } catch {}
    try {
      await db.schema.dropTable('organization').execute();
    } catch {}

    // org table (from migration)
    await db.schema
      .createTable('organization')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar(255)', (c) => c.notNull())
      .addColumn('slug', 'varchar(255)', (c) => c.notNull())
      .addColumn('type', 'varchar(255)', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    // org_member table (from migration)
    await db.schema
      .createTable('organization_member')
      .addColumn('organization_id', 'uuid', (c) => c.notNull())
      .addColumn('user_id', 'uuid', (c) => c.notNull())
      .addColumn('created_at', 'timestamp', (c) => c.notNull().defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.notNull().defaultTo(new Date().toISOString()))
      .addPrimaryKeyConstraint('organization_member_pk', ['organization_id', 'user_id'])
      .execute();

    // insert baseline orgs
    orgId = randomUUID();
    orgId2 = randomUUID();
    await db
      .insertInto('organization')
      .values({
        id: orgId,
        name: 'Org One',
        slug: 'org-one',
        type: 'Startup',
        metadata: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    await db
      .insertInto('organization')
      .values({
        id: orgId2,
        name: 'Org Two',
        slug: 'org-two',
        type: 'Agency',
        metadata: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();
  });

  beforeEach(async () => {
    await db.deleteFrom('organization_member').execute();
    userId = randomUUID();
  });

  describe('addOrganizationMember', () => {
    it('adds a member', async () => {
      const member = await repo.addOrganizationMember(orgId, { user_id: userId });
      expect(member.organization_id).toBe(orgId);
      expect(member.user_id).toBe(userId);
      expect(typeof member.created_at).toBe('string');
      expect(typeof member.updated_at).toBe('string');

      const found = await db.selectFrom('organization_member').selectAll().execute();
      expect(found).toHaveLength(1);
    });
  });

  describe('getOrganizationMember', () => {
    it('fetches an existing member', async () => {
      await repo.addOrganizationMember(orgId, { user_id: userId });
      const found = await repo.getOrganizationMember(orgId, userId);
      expect(found).not.toBeNull();
      expect(found?.organization_id).toBe(orgId);
    });

    it('returns null if not found', async () => {
      const found = await repo.getOrganizationMember(orgId, userId);
      expect(found).toBeNull();
    });
  });

  describe('listOrganizationMembers', () => {
    it('lists members of org', async () => {
      await repo.addOrganizationMember(orgId, { user_id: userId });
      await repo.addOrganizationMember(orgId, { user_id: randomUUID() });

      const members = await repo.listOrganizationMembers(orgId, 10, 0);
      expect(members.length).toBe(2);
      expect(members.every((m) => m.organization_id === orgId)).toBe(true);
    });

    it('respects pagination', async () => {
      for (let i = 0; i < 3; i++) {
        await repo.addOrganizationMember(orgId, { user_id: randomUUID() });
      }
      const firstPage = await repo.listOrganizationMembers(orgId, 2, 0);
      const secondPage = await repo.listOrganizationMembers(orgId, 2, 2);

      expect(firstPage.length).toBe(2);
      expect(secondPage.length).toBe(1);
    });
  });

  describe('listUserOrganizations', () => {
    it('lists orgs the user belongs to', async () => {
      await repo.addOrganizationMember(orgId, { user_id: userId });
      await repo.addOrganizationMember(orgId2, { user_id: userId });

      const orgs = await repo.listUserOrganizations(userId);
      expect(orgs.map((o) => o.id)).toEqual(expect.arrayContaining([orgId, orgId2]));
    });

    it('returns empty if user not in any orgs', async () => {
      const orgs = await repo.listUserOrganizations(userId);
      expect(orgs).toEqual([]);
    });
  });

  describe('removeOrganizationMember', () => {
    it('removes an existing member', async () => {
      await repo.addOrganizationMember(orgId, { user_id: userId });
      const removed = await repo.removeOrganizationMember({
        organization_id: orgId,
        user_id: userId,
      });
      expect(removed).toBe(true);

      const stillThere = await repo.getOrganizationMember(orgId, userId);
      expect(stillThere).toBeNull();
    });

    it('returns false if member does not exist', async () => {
      const removed = await repo.removeOrganizationMember({
        organization_id: orgId,
        user_id: userId,
      });
      expect(removed).toBe(false);
    });
  });

  describe('isUserInOrganization', () => {
    it('returns true if member exists', async () => {
      await repo.addOrganizationMember(orgId, { user_id: userId });
      const result = await repo.isUserInOrganization(orgId, userId);
      expect(result).toBe(true);
    });

    it('returns false if member does not exist', async () => {
      const result = await repo.isUserInOrganization(orgId, userId);
      expect(result).toBe(false);
    });
  });
});
