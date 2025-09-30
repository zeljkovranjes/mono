import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/projectMember.repo';

describe('projectMember.repo (pg-mem integration tests)', () => {
  let projectId: string;
  let userId: string;

  beforeAll(async () => {
    // Drop tables if they exist
    try {
      await db.schema.dropTable('project_member').execute();
    } catch {}
    try {
      await db.schema.dropTable('project').execute();
    } catch {}
    try {
      await db.schema.dropTable('organization').execute();
    } catch {}

    // organization table (simplified for FK)
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

    // project table
    await db.schema
      .createTable('project')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar(255)', (c) => c.notNull())
      .addColumn('organization_id', 'uuid', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    // project_member table
    await db.schema
      .createTable('project_member')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('project_id', 'uuid', (c) => c.notNull())
      .addColumn('user_id', 'uuid', (c) => c.notNull())
      .execute();

    // baseline org + project
    const orgId = randomUUID();
    await db
      .insertInto('organization')
      .values({
        id: orgId,
        name: 'Test Org',
        slug: 'test-org',
        type: 'Startup',
        metadata: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    projectId = randomUUID();
    await db
      .insertInto('project')
      .values({
        id: projectId,
        name: 'Test Project',
        organization_id: orgId,
        metadata: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();
  });

  beforeEach(async () => {
    await db.deleteFrom('project_member').execute();
    userId = randomUUID();
  });

  describe('addProjectMember', () => {
    it('adds a project member', async () => {
      const member = await repo.addProjectMember({ project_id: projectId, user_id: userId });
      expect(member.project_id).toBe(projectId);
      expect(member.user_id).toBe(userId);

      const found = await db.selectFrom('project_member').selectAll().execute();
      expect(found).toHaveLength(1);
    });
  });

  describe('removeProjectMember', () => {
    it('removes a project member', async () => {
      await repo.addProjectMember({ project_id: projectId, user_id: userId });
      const removed = await repo.removeProjectMember({ project_id: projectId, user_id: userId });
      expect(removed).toBe(true);

      const stillThere = await db.selectFrom('project_member').selectAll().execute();
      expect(stillThere).toHaveLength(0);
    });

    it('returns false if not found', async () => {
      const removed = await repo.removeProjectMember({ project_id: projectId, user_id: userId });
      expect(removed).toBe(false);
    });
  });

  describe('listProjectMembers', () => {
    it('lists all members of a project', async () => {
      await repo.addProjectMember({ project_id: projectId, user_id: userId });
      await repo.addProjectMember({ project_id: projectId, user_id: randomUUID() });

      const members = await repo.listProjectMembers(projectId);
      expect(members).toHaveLength(2);
      expect(members.every((m) => m.project_id === projectId)).toBe(true);
    });
  });

  describe('isUserInProject', () => {
    it('returns true if user is in project', async () => {
      await repo.addProjectMember({ project_id: projectId, user_id: userId });
      const result = await repo.isUserInProject(projectId, userId);
      expect(result).toBe(true);
    });

    it('returns false if user not in project', async () => {
      const result = await repo.isUserInProject(projectId, userId);
      expect(result).toBe(false);
    });
  });
});
