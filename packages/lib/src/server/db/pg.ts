import { PostgresDialect, Kysely } from 'kysely';
import { getServerConfig } from '../env/runtime';
import { Pool } from 'pg';

export const postgresDialect = new PostgresDialect({
  pool: new Pool({
    connectionString: getServerConfig().POSTGRES_DATABASE_URL,
  }),
});

/*
export const db = new Kysely<DB>({
  dialect: postgresDialect,
});
*/
