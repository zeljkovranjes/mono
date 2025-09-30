import { newDb } from 'pg-mem';
import { DB } from '../types/pg-database-types';
import { Kysely } from 'kysely';

/**
 * Creates and returns a pg-mem–backed Kysely instance.
 *
 * This is the in-memory equivalent of your Postgres dialect setup.
 */
function getPgMemDb() {
  const mem = newDb();
  return mem.adapters.createKysely() as Kysely<DB>;
}

// Single ready-to-use export
export const db = getPgMemDb();
