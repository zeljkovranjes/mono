import { createSignal, onMount, Show } from 'solid-js';
import { Button } from '@safeoutput/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@safeoutput/ui/components/card';
import { LabeledSeparator } from '@safeoutput/ui/components/separator';
import { Callout, CalloutContent } from '@safeoutput/ui/components/callout';
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
} from '@safeoutput/ui/components/text-field';
import { Skeleton } from '@safeoutput/ui/components/skeleton';
import { getPlatformBullet } from '~/utils/display';
import { LoginFlow } from '@ory/client';
import { getOryFrontend } from '@safeoutput/lib/shared/auth/ory';
import OidcProvider, { useOidc } from '~/components/reusable/oidcProvider';
import chalk from 'chalk';

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

  const getFlowError = (): string | null => {
    const flow = loginFlow();
    if (!flow?.ui?.messages) return null;

    const errorMessage = flow.ui.messages.find((msg) => msg.type === 'error');
    if (errorMessage) return errorMessage.text;

    // Check for field-level errors and make them more user-friendly
    const nodes = flow.ui.nodes || [];
    for (const node of nodes) {
      if (node.messages && node.messages.length > 0) {
        const fieldError = node.messages.find((msg) => msg.type === 'error');
        if (fieldError) {
          const fieldName = (node.attributes as any)?.name;
          // Make error messages more user-friendly
          if (fieldName === 'identifier') {
            return `Email: ${fieldError.text}`;
          } else if (fieldName === 'password') {
            return `Password: ${fieldError.text}`;
          }
          return fieldError.text;
        }
      }
    }

    return null;
  };

  const { oidcProviders, isOidcLoading, handleOidcLogin, extractProviders } = useOidc(
    loginFlow,
    getCsrfToken,
    'login',
  );

  const initialize = async () => {
    console.log(chalk.gray(`→ Initializing Loginflow session...`));
    try {
      setIsInitializing(true);
      setError(null);
      const url = new URL(window.location.href);
      const flowId = url.searchParams.get('flow');

      let flow: LoginFlow;
      if (flowId) {
        try {
          flow = await getExistingLoginFlow(flowId);
          console.log(
            chalk.green(`✔ Reused Loginflow session with flow id: ${chalk.underline(flowId)}`),
          );
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
        console.log(
          chalk.green(
            `✔ Initialized Loginflow generated session with flow id: ${chalk.underline(flow.id)}`,
          ),
        );
      }

      setLoginFlow(flow);
      extractProviders();
    } catch (err: any) {
      console.error(chalk.red(`✘ Failed to initialize Loginflow session with flow id: {${err}}`));
      setError('Failed to initialize login. Please refresh the page.');
    } finally {
      setIsInitializing(false);
    }
  };

  const getFieldError = (name: string): string | null => {
    // @ts-ignore
    const field = loginFlow()?.ui?.nodes.find((n) => n.attributes?.name === name);
    const msg = field?.messages?.find((m) => m.type === 'error');

    if (!msg) return null;

    // Make error messages more user-friendly
    const errorText = msg.text;

    // Common validation error improvements
    if (errorText.includes('required')) {
      return 'This field is required';
    }
    if (errorText.includes('email') && errorText.includes('invalid')) {
      return 'Please enter a valid email address';
    }
    if (errorText.includes('credentials') && errorText.includes('invalid')) {
      return 'Invalid email or password';
    }
    if (errorText.includes('password') && errorText.includes('incorrect')) {
      return 'Incorrect password';
    }

    return errorText;
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
  };

  const clearError = () => {
    setError(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const flow = loginFlow();
    if (!flow || isSubmitting()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await frontend.updateLoginFlow({
        flow: flow.id,
        updateLoginFlowBody: {
          method: 'password',
          identifier: email(),
          password: password(),
          csrf_token: getCsrfToken(),
        },
      });

      clearForm();
      setTimeout(() => (window.location.href = '/dashboard'), 100);
    } catch (err: any) {
      console.error('Login error:', err);

      clearForm();

      if (err.response?.status === 400 && err.response?.data) {
        setLoginFlow(err.response.data);
        extractProviders();
        const errorMsg = getFlowError();
        if (errorMsg) {
          setError(errorMsg);
        } else {
          // Fallback with more specific error based on likely causes
          setError('Invalid email or password. Please check your credentials and try again.');
        }
      } else if (err.response?.status === 422) {
        await initialize();
      } else {
        setError('Login failed. Please try again.');
      }

      await Promise.resolve();
    } finally {
      setIsSubmitting(false);
    }
  };

  onMount(() => {
    initialize();
  });

  const LoadingSkeleton = () => (
    <Card class="w-[384px] max-w-[384px] max-h-[466px]">
      <CardHeader class="pb-0 flex flex-col gap-1">
        <CardTitle>
          <Skeleton height={20} width={80} radius={6} />
        </CardTitle>
        <CardDescription class="flex gap-1 items-center">
          <Skeleton height={18} width={150} radius={4} />
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
        <Skeleton height={38} width={336} radius={6} />
      </CardContent>
      <CardFooter class="relative bottom-4">
        <Skeleton height={20} width={150} radius={4} />
      </CardFooter>
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
            <Callout variant="error">
              <CalloutContent>{error()}</CalloutContent>
            </Callout>
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
            <TextField validationState={getFieldError('identifier') ? 'invalid' : 'valid'}>
              <TextFieldLabel>Email</TextFieldLabel>
              <TextFieldInput
                type="email"
                placeholder="example@domain.com"
                value={email()}
                autocomplete={'email'}
                onInput={(e) => {
                  setEmail(e.currentTarget.value);
                  if (error()) clearError();
                }}
                required
              />
              <Show when={getFieldError('identifier')}>
                <TextFieldErrorMessage>{getFieldError('identifier')}</TextFieldErrorMessage>
              </Show>
            </TextField>
            <TextField validationState={getFieldError('password') ? 'invalid' : 'valid'}>
              <TextFieldLabel>Password</TextFieldLabel>
              <TextFieldInput
                type="password"
                placeholder={getPlatformBullet().repeat(12)}
                value={password()}
                autocomplete={'current-password'}
                onInput={(e) => {
                  setPassword(e.currentTarget.value);
                  if (error()) clearError();
                }}
                required
              />
              <Show when={getFieldError('password')}>
                <TextFieldErrorMessage>{getFieldError('password')}</TextFieldErrorMessage>
              </Show>
            </TextField>
            <Button
              type="submit"
              loading={isSubmitting()}
              disabled={isSubmitting() || !email() || !password()}
            >
              {isSubmitting() ? 'Logging in...' : 'Log in to account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter class="p-0">
          <Button variant="link">Forgot password?</Button>
        </CardFooter>
      </Card>
    </Show>
  );
}
