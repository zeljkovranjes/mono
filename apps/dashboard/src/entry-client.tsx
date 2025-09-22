// @refresh reload
import { setupClient } from '@safeoutput/lib/client/env/runtime';
import { clientEnvSchema } from '@safeoutput/lib/client/env/schema';
import { mount, StartClient } from '@solidjs/start/client';

// inject client side envs into @safeoutput/lib
setupClient({
  client: clientEnvSchema.parse(import.meta.env),
});

mount(() => <StartClient />, document.getElementById('app')!);
