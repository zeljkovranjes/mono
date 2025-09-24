// @refresh reload
import { setupClientEnvironment } from '@safeoutput/lib/client/env/runtime';
setupClientEnvironment(import.meta.env);

import { mount, StartClient } from '@solidjs/start/client';

// inject client side envs into @safeoutput/lib

mount(() => <StartClient />, document.getElementById('app')!);
