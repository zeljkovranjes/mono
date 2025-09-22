import { createSignal, onMount, Show } from 'solid-js';
import { Button } from '@safeoutput/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@safeoutput/ui/components/card';
import { LabeledSeparator } from '@safeoutput/ui/components/separator';
import { TextField, TextFieldInput, TextFieldLabel } from '@safeoutput/ui/components/text-field';
import { Skeleton } from '@safeoutput/ui/components/skeleton';
import { getPlatformBullet } from '~/utils/display';
import { LoginFlow } from '@ory/client';
import { getOryFrontend } from '@safeoutput/lib/shared/auth/ory';
import OidcProvider, { useOidc } from '~/components/reusable/oidcProvider';

let frontend = getOryFrontend();

export default function Login() {
  const [loginFlow, setLoginFlow] = createSignal<LoginFlow | null>(null);
  const [isInitializing, setIsInitializing] = createSignal(true);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const updateUrlWithFlowId = (flowId: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('flow', flowId);
    window.history.replaceState({}, '', newUrl.toString());
  };

  const createNewLoginFlow = async (): Promise<LoginFlow> => {
    const { data } = await frontend.createBrowserLoginFlow({});
    updateUrlWithFlowId(data.id);
    return data;
  };

  const getExistingLoginFlow = async (flowId: string): Promise<LoginFlow> => {
    const { data } = await frontend.getLoginFlow({ id: flowId });
    return data;
  };

  const getCsrfToken = (): string => {
    const flow = loginFlow();
    if (!flow?.ui?.nodes) return '';
    // @ts-ignore
    const node = flow.ui.nodes.find((n) => n.attributes?.name === 'csrf_token');
    return (node?.attributes as any)?.value || '';
  };

  // Add the OIDC hook after getCsrfToken is defined
  const { oidcProviders, isOidcLoading, handleOidcLogin, extractProviders } = useOidc(
    loginFlow,
    getCsrfToken,
    'login',
  );

  const initialize = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      const url = new URL(window.location.href);
      const flowId = url.searchParams.get('flow');

      let flow: LoginFlow;
      if (flowId) {
        try {
          flow = await getExistingLoginFlow(flowId);
        } catch (err: any) {
          const status = err.response?.status;
          if (status === 404 || status === 403 || status === 410) {
            flow = await createNewLoginFlow();
          } else {
            throw err;
          }
        }
      } else {
        flow = await createNewLoginFlow();
      }

      setLoginFlow(flow);
      // Extract OIDC providers after setting the flow
      extractProviders();
    } catch (err: any) {
      console.error('Failed to init login flow', err);
      setError('Failed to initialize login. Please refresh the page.');
    } finally {
      setIsInitializing(false);
    }
  };

  const getFieldError = (name: string): string | null => {
    // @ts-ignore
    const field = loginFlow()?.ui?.nodes.find((n) => n.attributes?.name === name);
    const msg = field?.messages?.find((m) => m.type === 'error');
    return msg?.text || null;
  };
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const flow = loginFlow();
    if (!flow || isSubmitting()) return;
    try {
      setIsSubmitting(true);
      const { data } = await frontend.updateLoginFlow({
        flow: flow.id,
        updateLoginFlowBody: {
          method: 'password',
          identifier: email(),
          password: password(),
          csrf_token: getCsrfToken(),
        },
      });
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.response?.status === 400 && err.response?.data) {
        setLoginFlow(err.response.data);
        extractProviders();
      } else if (err.response?.status === 422) {
        await initialize();
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  onMount(() => {
    initialize();
  });

  const LoadingSkeleton = () => (
    <Card class="w-[384px] max-w-[384px]">
      <CardHeader class="pb-0">
        <CardTitle>
          <Skeleton height={32} width={80} radius={6} />
        </CardTitle>
        <CardDescription class="flex gap-1 items-center">
          <Skeleton height={20} width={150} radius={4} />
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <Skeleton height={40} width={336} radius={6} />
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1">
            <Skeleton height={1} width={150} radius={0} />
          </div>
          <Skeleton height={16} width={20} radius={4} />
          <div class="flex-1">
            <Skeleton height={1} width={150} radius={0} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Skeleton height={16} width={50} radius={4} />
          <Skeleton height={40} width={336} radius={6} />
        </div>
        <div class="flex flex-col gap-2">
          <Skeleton height={16} width={70} radius={4} />
          <Skeleton height={40} width={336} radius={6} />
        </div>
        <Skeleton height={40} width={336} radius={6} />
      </CardContent>
    </Card>
  );

  return (
    <Show when={!isInitializing()} fallback={<LoadingSkeleton />}>
      <Card class="w-[384px] max-w-[384px]">
        <CardHeader class="mb-0 pb-0">
          <CardTitle>Log in</CardTitle>
          <CardDescription class="flex gap-1 items-center">
            New to Safeoutput?
            <Button variant="link" class="p-0">
              Sign up
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-5">
          <Show when={error()}>
            <div class="text-red-600 text-sm bg-red-50 p-3 rounded">{error()}</div>
          </Show>
          <OidcProvider
            flow={loginFlow}
            getCsrfToken={getCsrfToken}
            flowType="login"
            oidcProviders={oidcProviders}
            isOidcLoading={isOidcLoading}
            handleOidcLogin={handleOidcLogin}
          />
          <form onSubmit={handleSubmit} class="flex flex-col gap-5">
            <LabeledSeparator>OR</LabeledSeparator>
            <TextField>
              <TextFieldLabel>Email</TextFieldLabel>
              <TextFieldInput
                type="email"
                placeholder="example@domain.com"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <Show when={getFieldError('identifier')}>
                <div class="text-red-600 text-xs mt-1">{getFieldError('identifier')}</div>
              </Show>
            </TextField>
            <TextField>
              <TextFieldLabel>Password</TextFieldLabel>
              <TextFieldInput
                type="password"
                placeholder={getPlatformBullet().repeat(12)}
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
              />
              <Show when={getFieldError('password')}>
                <div class="text-red-600 text-xs mt-1">{getFieldError('password')}</div>
              </Show>
            </TextField>
            <Button type="submit" disabled={isSubmitting() || !email() || !password()}>
              {isSubmitting() ? 'Logging in...' : 'Log in to account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Show>
  );
}
