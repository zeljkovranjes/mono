// migrations/000X_project_member.ts
import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('project_member')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('project_id', 'uuid', (col) => col.notNull())
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addForeignKeyConstraint('project_member_project_fk', ['project_id'], 'project', ['id'], (fk) =>
      fk.onDelete('cascade'),
    )
    .addUniqueConstraint('project_member_project_user_uniq', ['project_id', 'user_id'])
    .execute();

  // Indexes for common lookups
  await db.schema
    .createIndex('project_member_project_idx')
    .on('project_member')
    .column('project_id')
    .execute();

  await db.schema
    .createIndex('project_member_user_idx')
    .on('project_member')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('project_member_user_idx').ifExists().execute();
  await db.schema.dropIndex('project_member_project_idx').ifExists().execute();
  await db.schema.dropTable('project_member').ifExists().execute();
}
