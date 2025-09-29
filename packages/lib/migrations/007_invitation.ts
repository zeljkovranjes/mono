/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION ensure_invitation_project_org_match()
    RETURNS TRIGGER AS $$
    DECLARE
      proj_org uuid;
    BEGIN
      IF NEW.project_id IS NOT NULL THEN
        SELECT organization_id INTO proj_org FROM project WHERE id = NEW.project_id;
        IF proj_org IS NULL THEN
          RAISE EXCEPTION 'project % not found', NEW.project_id;
        END IF;

        IF NEW.scope = 'project' AND NEW.organization_id IS NOT NULL AND NEW.organization_id <> proj_org THEN
          RAISE EXCEPTION 'organization_id % does not match project.organization_id % for project %',
            NEW.organization_id, proj_org, NEW.project_id;
        END IF;

        IF NEW.scope = 'project' AND NEW.organization_id IS NULL THEN
          NEW.organization_id = proj_org;
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await db.schema
    .createTable('invitation')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('scope', 'varchar(32)', (c) => c.notNull()) // 'organization' | 'project'
    .addColumn('organization_id', 'uuid')
    .addColumn('project_id', 'uuid')
    .addColumn('inviter_user_id', 'uuid', (c) => c.notNull())
    .addColumn('invitee_email', 'varchar(320)', (c) => c.notNull())
    .addColumn('invitee_user_id', 'uuid')
    .addColumn('role', 'varchar(64)')
    .addColumn('token', 'varchar(255)', (c) => c.notNull().unique())
    .addColumn('status', 'varchar(32)', (c) => c.notNull().defaultTo('pending'))
    .addColumn('expires_at', 'timestamp')
    .addColumn('metadata', 'jsonb', (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamp', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (c) => c.notNull().defaultTo(sql`now()`))
    .addForeignKeyConstraint(
      'invitation_org_fk',
      ['organization_id'],
      'organization',
      ['id'],
      (fk) => fk.onDelete('cascade'),
    )
    .addForeignKeyConstraint('invitation_project_fk', ['project_id'], 'project', ['id'], (fk) =>
      fk.onDelete('cascade'),
    )
    .execute();

  await sql`
    ALTER TABLE invitation
    ADD CONSTRAINT invitation_scope_ids_chk
    CHECK (
      (scope = 'organization' AND organization_id IS NOT NULL AND project_id IS NULL)
      OR
      (scope = 'project' AND project_id IS NOT NULL)
    )
  `.execute(db);

  await sql`
    ALTER TABLE invitation
    ADD CONSTRAINT invitation_email_format_chk
    CHECK (position('@' in invitee_email) > 1)
  `.execute(db);

  await sql`
    CREATE TRIGGER trg_invitation_org_guard
    BEFORE INSERT OR UPDATE ON invitation
    FOR EACH ROW EXECUTE FUNCTION ensure_invitation_project_org_match();
  `.execute(db);

  await sql`
    CREATE TRIGGER trg_invitation_updated_at
    BEFORE UPDATE ON invitation
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);

  await db.schema.createIndex('invitation_token_idx').on('invitation').column('token').execute();
  await db.schema
    .createIndex('invitation_status_expires_idx')
    .on('invitation')
    .columns(['status', 'expires_at'])
    .execute();
  await sql`CREATE INDEX invitation_email_lower_idx ON invitation (lower(invitee_email))`.execute(
    db,
  );
  await db.schema
    .createIndex('invitation_org_idx')
    .on('invitation')
    .column('organization_id')
    .execute();
  await db.schema
    .createIndex('invitation_proj_idx')
    .on('invitation')
    .column('project_id')
    .execute();

  await sql`
    CREATE UNIQUE INDEX invitation_unique_pending_org
    ON invitation (organization_id, lower(invitee_email))
    WHERE scope = 'organization' AND status = 'pending'
  `.execute(db);

  await sql`
    CREATE UNIQUE INDEX invitation_unique_pending_proj
    ON invitation (project_id, lower(invitee_email))
    WHERE scope = 'project' AND status = 'pending'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS invitation_unique_pending_proj`.execute(db);
  await sql`DROP INDEX IF EXISTS invitation_unique_pending_org`.execute(db);
  await db.schema.dropIndex('invitation_proj_idx').ifExists().execute();
  await db.schema.dropIndex('invitation_org_idx').ifExists().execute();
  await db.schema.dropIndex('invitation_status_expires_idx').ifExists().execute();
  await db.schema.dropIndex('invitation_token_idx').ifExists().execute();
  await sql`DROP INDEX IF EXISTS invitation_email_lower_idx`.execute(db);
  await sql`DROP TRIGGER IF EXISTS trg_invitation_updated_at ON invitation`.execute(db);
  await sql`DROP TRIGGER IF EXISTS trg_invitation_org_guard ON invitation`.execute(db);
  await sql`DROP FUNCTION IF EXISTS ensure_invitation_project_org_match`.execute(db);
  await db.schema.dropTable('invitation').ifExists().execute();
}
