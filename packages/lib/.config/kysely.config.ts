import {
  DummyDriver,
  PostgresAdapter,
  PostgresDialect,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { postgresDialect } from '../src/server/db/pg';

export default defineConfig({
  dialect: postgresDialect,
  //   migrations: {
  //     migrationFolder: "migrations",
  //   },
  //   plugins: [],
  //   seeds: {
  //     seedFolder: "seeds",
  //   }
});
