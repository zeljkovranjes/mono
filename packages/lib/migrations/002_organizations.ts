/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('organization')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull())
    .addColumn('type', 'varchar(255)', (col) => col.notNull()) // keep text per your example
    .addColumn('metadata', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('customer_id', 'varchar(255)')
    .addColumn('subscription_status', 'varchar(255)')
    .addColumn('current_plan_id', 'uuid', (col) => col.references('plan.id').onDelete('set null'))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('organization_slug_unique', ['slug'])
    .execute();

  // enforce slug format
  await sql`
    ALTER TABLE organization
    ADD CONSTRAINT organization_slug_format_chk
    CHECK (slug ~ '^[a-z0-9-]+$')
  `.execute(db);

  // indexes (lean, non-redundant)
  await db.schema
    .createIndex('organization_created_at_idx')
    .on('organization')
    .column('created_at')
    .execute();
  await db.schema
    .createIndex('organization_current_plan_id_idx')
    .on('organization')
    .column('current_plan_id')
    .execute();
  await sql`CREATE INDEX organization_metadata_gin ON organization USING GIN (metadata)`.execute(
    db,
  );

  await sql`
    CREATE TRIGGER trg_organization_updated_at
    BEFORE UPDATE ON organization
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trg_organization_updated_at ON organization`.execute(db);
  await sql`DROP INDEX IF EXISTS organization_metadata_gin`.execute(db);
  await db.schema.dropIndex('organization_current_plan_id_idx').ifExists().execute();
  await db.schema.dropIndex('organization_created_at_idx').ifExists().execute();
  await db.schema.dropTable('organization').ifExists().execute();
}
