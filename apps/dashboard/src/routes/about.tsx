import { Button } from '@safeoutput/ui/components/button';
import { A } from '@solidjs/router';
import Counter from '~/components/Counter';

export default function About() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <Button>adsds</Button>
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        {import.meta.env.VITE_ROOT_DOMAIN}
      </h1>
      <Counter />
      <p class="mt-8">
        Visit{' '}
        <a href="https://solidjs.com" target="_blank" class="text-sky-600 hover:underline">
          solidjs.com
        </a>{' '}
        to learn how to build Solid apps.
      </p>
      <p class="my-4">
        <A href="/" class="text-sky-600 hover:underline">
          Home
        </A>
        {' - '}
        <span>About Page</span>
      </p>
    </main>
  );
}
