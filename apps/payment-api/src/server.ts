import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

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
