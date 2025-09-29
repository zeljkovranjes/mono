/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // enable UUID default
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);

  // shared updated_at trigger function
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // plan
  await db.schema
    .createTable('plan')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text') // nullable by default
    .addColumn('stripe_price_id', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('stripe_product_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('price_per_month', 'integer', (col) => col.notNull())
    .addColumn('metadata', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // constraints & indexes (no redundant ones)
  await sql`
    ALTER TABLE plan
    ADD CONSTRAINT plan_price_per_month_chk CHECK (price_per_month >= 0)
  `.execute(db);

  await db.schema.createIndex('plan_created_at_idx').on('plan').column('created_at').execute();
  await sql`CREATE INDEX plan_metadata_gin ON plan USING GIN (metadata)`.execute(db);

  await sql`
    CREATE TRIGGER trg_plan_updated_at
    BEFORE UPDATE ON plan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trg_plan_updated_at ON plan`.execute(db);
  await sql`DROP INDEX IF EXISTS plan_metadata_gin`.execute(db);
  await db.schema.dropIndex('plan_created_at_idx').ifExists().execute();
  await db.schema.dropTable('plan').ifExists().execute();
  await sql`DROP FUNCTION IF EXISTS set_updated_at`.execute(db);
}
