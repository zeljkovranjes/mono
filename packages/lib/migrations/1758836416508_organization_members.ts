import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('organization_member')
    .addColumn('organization_id', 'uuid', (col) => col.notNull())
    .addColumn('user_id', 'uuid', (col) => col.notNull()) // Ory Kratos identity, no FK
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('organization_member_pk', ['organization_id', 'user_id'])
    .addForeignKeyConstraint(
      'organization_member_organization_fk',
      ['organization_id'],
      'organization',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .execute();

  // helpful index for listing members by org and time
  await db.schema
    .createIndex('organization_member_org_created_idx')
    .on('organization_member')
    .columns(['organization_id', 'created_at'])
    .execute();

  await sql`
    CREATE TRIGGER trg_organization_member_updated_at
    BEFORE UPDATE ON organization_member
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS trg_organization_member_updated_at ON organization_member`.execute(
    db,
  );
  await db.schema.dropIndex('organization_member_org_created_idx').ifExists().execute();
  await db.schema.dropTable('organization_member').ifExists().execute();
}
