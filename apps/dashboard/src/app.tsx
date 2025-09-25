import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import '@safeoutput/ui/app.css';
import { setupClientEnvironment } from '@safeoutput/lib/client/env/runtime';
setupClientEnvironment(import.meta.env);

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          {/*
          <Nav />
          */}
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
