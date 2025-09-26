// migrations/000X_project_member.ts
import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);

  await db.schema
    .createTable('project_member')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('project_id', 'uuid', (col) => col.notNull())
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addForeignKeyConstraint('project_member_project_fk', ['project_id'], 'project', ['id'], (fk) =>
      fk.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'project_member_org_fk',
      ['organization_id'],
      'organization',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .addUniqueConstraint('project_member_project_user_uniq', ['project_id', 'user_id'])
    .execute();

  await db.schema
    .createIndex('project_member_project_idx')
    .on('project_member')
    .column('project_id')
    .execute();
  await db.schema
    .createIndex('project_member_org_idx')
    .on('project_member')
    .column('organization_id')
    .execute();
  await db.schema
    .createIndex('project_member_user_idx')
    .on('project_member')
    .column('user_id')
    .execute();

  await sql`
    CREATE OR REPLACE FUNCTION ensure_project_member_org_match()
    RETURNS TRIGGER AS $$
    DECLARE
      proj_org uuid;
    BEGIN
      SELECT organization_id INTO proj_org FROM project WHERE id = NEW.project_id;
      IF proj_org IS NULL THEN
        RAISE EXCEPTION 'project % does not exist', NEW.project_id;
      END IF;
      IF NEW.organization_id <> proj_org THEN
        RAISE EXCEPTION 'organization_id % does not match project.organization_id % for project %',
          NEW.organization_id, proj_org, NEW.project_id;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER trg_project_member_org_guard
    BEFORE INSERT OR UPDATE ON project_member
    FOR EACH ROW EXECUTE FUNCTION ensure_project_member_org_match();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trg_project_member_org_guard ON project_member`.execute(db);
  await sql`DROP FUNCTION IF EXISTS ensure_project_member_org_match`.execute(db);
  await db.schema.dropIndex('project_member_user_idx').ifExists().execute();
  await db.schema.dropIndex('project_member_org_idx').ifExists().execute();
  await db.schema.dropIndex('project_member_project_idx').ifExists().execute();
  await db.schema.dropTable('project_member').ifExists().execute();
}
