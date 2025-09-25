// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';
import { setupClientEnvironment } from '@safeoutput/lib/client/env/runtime';
setupClientEnvironment(import.meta.env);

mount(() => <StartClient />, document.getElementById('app')!);
