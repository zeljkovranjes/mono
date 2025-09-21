import { type IClientEnvSchema } from './schema';

export interface ClientEnv {
  client: IClientEnvSchema;
}

let clientEnv: ClientEnv | null = null;

export function setupClient(cfg: ClientEnv) {
  clientEnv = cfg;
}

/** @internal */
export function getClient(): ClientEnv {
  if (!clientEnv) {
    throw new Error(
      'Client environment has not been initialized. Call setupClient() at app startup.',
    );
  }
  return clientEnv;
}
