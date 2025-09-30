import { getLogger } from '@safeoutput/lib/server/logging/index';
import closeWithGrace from 'close-with-grace';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { setupServerEnvironment } from '@safeoutput/lib/server/env/runtime';
import serviceApp from './app';

setupServerEnvironment();

const app = Fastify({
  loggerInstance: getLogger(),
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all',
    },
  },
});

async function init() {
  app.register(serviceApp);
  await app.register(cors, {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-id'],
    credentials: true,
  });
  closeWithGrace({ delay: 500 }, async ({ err }) => {
    if (err != null) {
      app.log.error(err);
    }
    await app.close();
  });

  try {
    await app.listen({ port: 3018 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
/*
fastify.get('/', async function handler(request, reply) {
  return { some_variable: 'some value of variable' };
});

fastify.get('/about', async function handler(request, reply) {
  return { info: 'Super puper information is saved here' };
});

async function start() {
  try {
    await fastify.listen({ port: 3009 });
    console.log('Server is running on http://localhost:3009');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
*/
