/* eslint-disable */

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
import { RegistrationFlow } from '@ory/client';
import { getOryFrontend } from '@safeoutput/lib/client/auth/ory';
import OidcProvider, { useOidc } from '~/components/reusable/oidcProvider';
import chalk from 'chalk';

let frontend = getOryFrontend();

export default function SignUp() {
  const [registrationFlow, setRegistrationFlow] = createSignal<RegistrationFlow | null>(null);
  const [isInitializing, setIsInitializing] = createSignal(true);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [fullName, setFullName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const updateUrlWithFlowId = (flowId: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('flow', flowId);
    window.history.replaceState({}, '', newUrl.toString());
  };

  const createNewRegistrationFlow = async (): Promise<RegistrationFlow> => {
    const { data } = await frontend.createBrowserRegistrationFlow({});
    updateUrlWithFlowId(data.id);
    return data;
  };

  const getExistingRegistrationFlow = async (flowId: string): Promise<RegistrationFlow> => {
    const { data } = await frontend.getRegistrationFlow({ id: flowId });
    return data;
  };

  const getCsrfToken = (): string => {
    const flow = registrationFlow();
    if (!flow?.ui?.nodes) return '';
    // @ts-ignore
    const node = flow.ui.nodes.find((n) => n.attributes?.name === 'csrf_token');
    return (node?.attributes as any)?.value || '';
  };

  const getFlowError = (): string | null => {
    const flow = registrationFlow();
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
          if (fieldName === 'traits.email') {
            return `Email: ${fieldError.text}`;
          } else if (fieldName === 'password') {
            return `Password: ${fieldError.text}`;
          } else if (fieldName === 'traits.name.first' || fieldName === 'traits.name.last') {
            return `Name: ${fieldError.text}`;
          }
          return fieldError.text;
        }
      }
    }

    return null;
  };

  const getFieldError = (name: string): string | null => {
    // @ts-ignore
    const field = registrationFlow()?.ui?.nodes.find((n) => n.attributes?.name === name);
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
    if (errorText.includes('password') && errorText.includes('short')) {
      return 'Password is too short';
    }
    if (errorText.includes('expected object, but got string')) {
      return 'Please enter your full name';
    }

    return errorText;
  };

  const { oidcProviders, isOidcLoading, handleOidcLogin, extractProviders } = useOidc(
    registrationFlow,
    getCsrfToken,
    'registration',
  );

  const initialize = async () => {
    console.log(chalk.gray(`→ Initializing Registration flow session...`));
    try {
      setIsInitializing(true);
      setError(null);
      const url = new URL(window.location.href);
      const flowId = url.searchParams.get('flow');

      let flow: RegistrationFlow;
      if (flowId) {
        try {
          flow = await getExistingRegistrationFlow(flowId);
          console.log(
            chalk.green(
              `✔ Reused Registration flow session with flow id: ${chalk.underline(flowId)}`,
            ),
          );
        } catch (err: any) {
          const status = err.response?.status;
          if (status === 404 || status === 403 || status === 410) {
            flow = await createNewRegistrationFlow();
          } else {
            throw err;
          }
        }
      } else {
        flow = await createNewRegistrationFlow();
        console.log(
          chalk.green(
            `✔ Initialized Registration flow generated session with flow id: ${chalk.underline(flow.id)}`,
          ),
        );
      }

      setRegistrationFlow(flow);
      extractProviders();
    } catch (err: any) {
      console.error(
        chalk.red(`✘ Failed to initialize Registration flow session with flow id: {${err}}`),
      );
      setError('Failed to initialize registration. Please refresh the page.');
    } finally {
      setIsInitializing(false);
    }
  };

  const clearForm = () => {
    setPassword('');
  };

  const clearError = () => {
    setError(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const flow = registrationFlow();
    if (!flow || isSubmitting()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await frontend.updateRegistrationFlow({
        flow: flow.id,
        updateRegistrationFlowBody: {
          method: 'password',
          password: password(),
          csrf_token: getCsrfToken(),
          traits: {
            email: email(),
            name: {
              first: fullName().split(' ')[0] || '',
              last: fullName().split(' ').slice(1).join(' ') || '',
            },
          },
        },
      });

      clearForm();
      setTimeout(() => (window.location.href = '/dashboard'), 100);
    } catch (err: any) {
      console.error('Registration error:', err);

      clearForm();

      if (err.response?.status === 400 && err.response?.data) {
        setRegistrationFlow(err.response.data);
        extractProviders();
        const errorMsg = getFlowError();
        if (errorMsg) {
          setError(errorMsg);
        } else {
          // Fallback with more specific error based on likely causes
          setError(
            'Please check your information and try again. Make sure your email is valid and your password meets the requirements.',
          );
        }
      } else if (err.response?.status === 422) {
        await initialize();
      } else {
        setError('Registration failed. Please try again.');
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
    <Card class="w-[384px] max-w-[384px] max-h-[525px]">
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
        <div class="flex flex-col gap-3">
          <Skeleton height={16} width={60} radius={4} />
          <Skeleton height={40} width={336} radius={6} />
        </div>
        <div class="flex flex-col gap-3">
          <Skeleton height={16} width={50} radius={4} />
          <Skeleton height={40} width={336} radius={6} />
        </div>
        <div class="flex flex-col gap-3">
          <Skeleton height={16} width={70} radius={4} />
          <Skeleton height={40} width={336} radius={6} />
        </div>
        <Skeleton height={38} width={336} radius={6} />
      </CardContent>
    </Card>
  );

  return (
    <Show when={!isInitializing()} fallback={<LoadingSkeleton />}>
      <Card class="w-[384px] max-w-[384px]">
        <CardHeader class="mb-0 pb-0">
          <CardTitle>Sign up</CardTitle>
          <CardDescription class="flex gap-1 items-center">
            Already have an account?
            <Button variant="link" class="p-0" onClick={() => (window.location.href = '/login')}>
              Log in
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
            flow={registrationFlow}
            getCsrfToken={getCsrfToken}
            flowType="registration"
            oidcProviders={oidcProviders}
            isOidcLoading={isOidcLoading}
            handleOidcLogin={handleOidcLogin}
          />
          <form onSubmit={handleSubmit} class="flex flex-col gap-5">
            <LabeledSeparator>OR</LabeledSeparator>
            <TextField
              validationState={
                getFieldError('traits.name.first') || getFieldError('traits.name.last')
                  ? 'invalid'
                  : 'valid'
              }
            >
              <TextFieldLabel>Full Name</TextFieldLabel>
              <TextFieldInput
                type="text"
                placeholder="Your full name"
                value={fullName()}
                autocomplete="name"
                onInput={(e) => {
                  setFullName(e.currentTarget.value);
                  if (error()) clearError();
                }}
                required
              />
              <Show when={getFieldError('traits.name.first') || getFieldError('traits.name.last')}>
                <TextFieldErrorMessage>
                  {getFieldError('traits.name.first') || getFieldError('traits.name.last')}
                </TextFieldErrorMessage>
              </Show>
            </TextField>
            <TextField validationState={getFieldError('traits.email') ? 'invalid' : 'valid'}>
              <TextFieldLabel>Email</TextFieldLabel>
              <TextFieldInput
                type="email"
                placeholder="example@domain.com"
                value={email()}
                autocomplete="email"
                onInput={(e) => {
                  setEmail(e.currentTarget.value);
                  if (error()) clearError();
                }}
                required
              />
              <Show when={getFieldError('traits.email')}>
                <TextFieldErrorMessage>{getFieldError('traits.email')}</TextFieldErrorMessage>
              </Show>
            </TextField>
            <TextField validationState={getFieldError('password') ? 'invalid' : 'valid'}>
              <TextFieldLabel>Password</TextFieldLabel>
              <TextFieldInput
                type="password"
                placeholder={getPlatformBullet().repeat(12)}
                value={password()}
                autocomplete="new-password"
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
              disabled={isSubmitting() || !fullName() || !email() || !password()}
            >
              {isSubmitting() ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Show>
  );
}
