import { defineConfig } from 'kysely-ctl';
import { getPostgresDialect } from '../src/server/db/pg';
import { setupServerEnvironment } from '../src/server/env/runtime';

setupServerEnvironment();

export default defineConfig({
  dialect: getPostgresDialect(true),
  //   migrations: {
  //     migrationFolder: "migrations",
  //   },
  //   plugins: [],
  //   seeds: {
  //     seedFolder: "seeds",
  //   }
});
