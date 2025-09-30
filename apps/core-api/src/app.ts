import path from 'node:path';
import fs from 'node:fs';
import fastifyAutoload from '@fastify/autoload';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

export const options = {
  ajv: false,
};

async function safeAutoload(
  fastify: FastifyInstance,
  dirPath: string,
  options: any = {},
  logName?: string,
) {
  if (fs.existsSync(dirPath)) {
    if (logName) console.log(`📦 Loading ${logName} from: ${dirPath}`);
    await fastify.register(fastifyAutoload, {
      dir: dirPath,
      ...options,
    });
  } else {
    if (logName) console.log(`⚠️ ${logName} directory not found: ${dirPath}`);
  }
}

export default async function serviceApp(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const baseDir = __dirname;

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  const f = fastify.withTypeProvider<ZodTypeProvider>();

  // Load all directories with simplified calls
  await safeAutoload(
    f,
    path.join(baseDir, 'plugins/external'),
    { options: {} },
    'External Plugins',
  );

  await safeAutoload(f, path.join(baseDir, 'plugins/app'), { options: { ...opts } }, 'App Plugins');

  await safeAutoload(
    f,
    path.join(baseDir, 'routes'),
    {
      autoHooks: true,
      cascadeHooks: true,
      options: { ...opts },
    },
    'Routes',
  );

  // Error handler
  f.setErrorHandler((err, request, reply) => {
    f.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      'Unhandled error occurred',
    );

    reply.code(err.statusCode ?? 500);

    let message = 'Internal Server Error';
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });

  // Not found handler
  f.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      'Resource not found',
    );

    reply.code(404);
    return { message: 'Not Found' };
  });
}
