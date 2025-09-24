// @refresh reload
import { setupClientEnvironment } from '@safeoutput/lib/client/env/runtime';
import { mount, StartClient } from '@solidjs/start/client';

// inject client side envs into @safeoutput/lib
setupClientEnvironment(import.meta.env);

mount(() => <StartClient />, document.getElementById('app')!);
