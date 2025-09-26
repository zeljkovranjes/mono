import { Kysely, PostgresDialect } from 'kysely';
import { getServerConfig, setupServerEnvironment } from '../../env/runtime';
import { Pool } from 'pg';
import { DB } from '../types/pg-database-types';

/**
 * Creates and returns a configured Postgres dialect for Kysely.
 *
 * - If `for_migrations` is `true`, then it manually runs the setupServerEnvironment
 * for when you run migrations.
 *
 * @returns A `PostgresDialect` instance configured with a pooled connection.
 *
 * @example
 * const dialect = getPostgresDialect();
 */
export function getPostgresDialect() {
  setupServerEnvironment();
  return new PostgresDialect({
    pool: new Pool({
      connectionString: getServerConfig().POSTGRES_DATABASE_URL,
    }),
  });
}

export const db = new Kysely<DB>({
  dialect: getPostgresDialect(),
});

/*
export const db = new Kysely<DB>({
  dialect: getPostgresDialect(false),
});
*/
/*
export const postgresDialect = new PostgresDialect({
  pool: new Pool({
    connectionString: getServerConfig().POSTGRES_DATABASE_URL,
  }),
});
*/
/*
export const db = new Kysely<DB>({
  dialect: postgresDialect,
});
*/
