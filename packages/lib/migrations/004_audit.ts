/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('audit_log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('actor_id', 'uuid')
    .addColumn('entity_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('entity_id', 'uuid', (col) => col.notNull())
    .addColumn('event_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('diff', 'jsonb', (col) => col.notNull())
    .addColumn('context', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('audit_log_entity_idx')
    .on('audit_log')
    .columns(['entity_type', 'entity_id', 'created_at'])
    .execute();

  await db.schema
    .createIndex('audit_log_actor_created_idx')
    .on('audit_log')
    .columns(['actor_id', 'created_at'])
    .execute();

  // Add GIN on context only if you actually filter inside it:
  // await sql`CREATE INDEX audit_log_context_gin ON audit_log USING GIN (context)`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  // await sql`DROP INDEX IF EXISTS audit_log_context_gin`.execute(db)
  await db.schema.dropIndex('audit_log_actor_created_idx').ifExists().execute();
  await db.schema.dropIndex('audit_log_entity_idx').ifExists().execute();
  await db.schema.dropTable('audit_log').ifExists().execute();
}
