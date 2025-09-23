import { getOryFrontend } from '@safeoutput/lib/shared/auth/ory';
import type { APIEvent } from '@solidjs/start/server';
import { isAxiosError } from 'axios';

const frontend = getOryFrontend();

export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const flowId = url.searchParams.get('id');

  if (!flowId) {
    return new Response(
      JSON.stringify({
        message: 'No error ID provided.',
        code: 'NO_ID_PROVIDED',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const { data } = await frontend.getFlowError({ id: flowId });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to fetch error flow:', err);

    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 404 || status === 403 || status === 410) {
        return new Response(
          JSON.stringify({
            message: 'The requested error could not be found or has expired.',
            code: 'FLOW_EXPIRED',
          }),
          {
            status,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    return new Response(
      JSON.stringify({
        message: 'An unexpected error occurred while fetching the flow.',
        code: 'UNEXPECTED_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export function POST() {
  return new Response('Not Allowed', { status: 405 });
}

export function PATCH() {
  return new Response('Not Allowed', { status: 405 });
}

export function DELETE() {
  return new Response('Not Allowed', { status: 405 });
}
