import { defineConfig } from 'kysely-ctl';
import { getPostgresDialect } from '../src/server/db/postgres';

export default defineConfig({
  dialect: getPostgresDialect(),
});
