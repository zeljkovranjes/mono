import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';

vi.mock('../server/db/postgres', async () => {
  return await vi.importActual('../server/db/postgres/index.mock');
});

import { db } from '../server/db/postgres';
import * as repo from '../server/db/postgres/repo/project.repo';

describe('project.repo (pg-mem integration tests)', () => {
  let orgId: string;
  let projectId: string;

  beforeAll(async () => {
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
      .addColumn('slug', 'varchar(255)', (c) => c.notNull())
      .addColumn('type', 'varchar(255)', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    await db.schema
      .createTable('project')
      .addColumn('id', 'uuid', (c) => c.primaryKey())
      .addColumn('name', 'varchar(255)', (c) => c.notNull())
      .addColumn('organization_id', 'uuid', (c) => c.notNull())
      .addColumn('metadata', 'jsonb', (c) => c.defaultTo(JSON.stringify({})))
      .addColumn('created_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .addColumn('updated_at', 'timestamp', (c) => c.defaultTo(new Date().toISOString()))
      .execute();

    orgId = randomUUID();
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
  });

  beforeEach(async () => {
    await db.deleteFrom('project').execute();
    projectId = randomUUID();
  });

  describe('createProject', () => {
    it('creates a project', async () => {
      const project = await repo.createProject({
        name: 'Test Project',
        organization_id: orgId,
        metadata: {},
      });
      expect(project.name).toBe('Test Project');
      expect(project.organization_id).toBe(orgId);
      expect(typeof project.created_at).toBe('string');
    });
  });

  describe('getProjectById', () => {
    it('returns a project if exists', async () => {
      const project = await repo.createProject({
        name: 'Another Project',
        organization_id: orgId,
        metadata: {},
      });
      const found = await repo.getProjectById(project.id);
      expect(found?.id).toBe(project.id);
    });

    it('returns null if not found', async () => {
      const found = await repo.getProjectById(randomUUID());
      expect(found).toBeNull();
    });
  });

  describe('getOrganizationIdByProject', () => {
    it('returns org id for a project', async () => {
      const project = await repo.createProject({
        name: 'Org Project',
        organization_id: orgId,
        metadata: {},
      });
      const org = await repo.getOrganizationIdByProject(project.id);
      expect(org).toBe(orgId);
    });
  });

  describe('listProjectsByOrganization', () => {
    it('lists projects for org', async () => {
      await repo.createProject({ name: 'Proj 1', organization_id: orgId, metadata: {} });
      await repo.createProject({ name: 'Proj 2', organization_id: orgId, metadata: {} });
      const list = await repo.listProjectsByOrganization(orgId);
      expect(list.length).toBe(2);
    });

    it('respects pagination', async () => {
      for (let i = 0; i < 3; i++) {
        await repo.createProject({ name: `Proj ${i}`, organization_id: orgId, metadata: {} });
      }
      const firstPage = await repo.listProjectsByOrganization(orgId, 2, 0);
      const secondPage = await repo.listProjectsByOrganization(orgId, 2, 2);
      expect(firstPage.length).toBe(2);
      expect(secondPage.length).toBe(1);
    });
  });

  describe('updateProject', () => {
    it('updates a project name', async () => {
      const project = await repo.createProject({
        name: 'Old Name',
        organization_id: orgId,
        metadata: {},
      });
      const updated = await repo.updateProject(project.id, { name: 'New Name' });
      expect(updated?.name).toBe('New Name');
    });

    it('returns null if project not found', async () => {
      const updated = await repo.updateProject(randomUUID(), { name: 'Nothing' });
      expect(updated).toBeNull();
    });
  });

  describe('deleteProject', () => {
    it('deletes a project', async () => {
      const project = await repo.createProject({
        name: 'Temp',
        organization_id: orgId,
        metadata: {},
      });
      const deleted = await repo.deleteProject(project.id);
      expect(deleted).toBe(true);

      const stillThere = await repo.getProjectById(project.id);
      expect(stillThere).toBeNull();
    });

    it('returns false if project does not exist', async () => {
      const deleted = await repo.deleteProject(randomUUID());
      expect(deleted).toBe(false);
    });
  });
});
