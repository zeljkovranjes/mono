import * as codegen from 'kysely-codegen';
import path from 'path';
import { getServerConfig, setupServerEnvironment } from '../server/env/runtime';

async function main() {
  setupServerEnvironment();

  const cli = new codegen.Cli();

  const outDir = path.join(process.cwd(), '/src/server/db/types');
  const outFile = path.join(outDir, 'pg-database-types.ts');

  await cli.generate({
    url: getServerConfig().POSTGRES_DATABASE_URL,
    dialect: 'postgres',
    outFile,
  });

  console.log(`Successfully generated database types to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
