/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('project')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('metadata', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addForeignKeyConstraint(
      'project_organization_fk',
      ['organization_id'],
      'organization',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .addUniqueConstraint('project_org_name_unique', ['organization_id', 'name'])
    .execute();

  await db.schema
    .createIndex('project_organization_id_created_idx')
    .on('project')
    .columns(['organization_id', 'created_at'])
    .execute();

  await sql`CREATE INDEX project_metadata_gin ON project USING GIN (metadata)`.execute(db);

  await sql`
    CREATE TRIGGER trg_project_updated_at
    BEFORE UPDATE ON project
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trg_project_updated_at ON project`.execute(db);
  await sql`DROP INDEX IF EXISTS project_metadata_gin`.execute(db);
  await db.schema.dropIndex('project_organization_id_created_idx').ifExists().execute();
  await db.schema.dropTable('project').ifExists().execute();
}
