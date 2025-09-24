import { createSignal, For, Show } from 'solid-js';
import { Button } from '@safeoutput/ui/components/button';
import type { LoginFlow, RegistrationFlow } from '@ory/client';
import { getOryFrontend } from '@safeoutput/lib/shared/auth/ory';
import { OryNode, OryErrorResponse, isOryNode } from '@safeoutput/lib/shared/auth/types/ory';

const frontend = getOryFrontend();

export function useOidc(
  flow: () => LoginFlow | RegistrationFlow | null,
  getCsrfToken: () => string,
  flowType: 'login' | 'registration' = 'login',
) {
  const [isOidcLoading, setIsOidcLoading] = createSignal(false);
  const [oidcProviders, setOidcProviders] = createSignal<OryNode[]>([]);

  const extractProviders = () => {
    const currentFlow = flow();
    if (currentFlow?.ui?.nodes) {
      const nodes = currentFlow.ui.nodes
        .filter((n) => n.group === 'oidc')
        .filter(isOryNode) as unknown as OryNode[];

      setOidcProviders(nodes);
    }
  };

  const handleOidcLogin = async (providerNode: OryNode) => {
    const currentFlow = flow();
    const csrfToken = getCsrfToken();
    if (!currentFlow || !csrfToken) return;

    try {
      setIsOidcLoading(true);

      if (flowType === 'login') {
        await frontend.updateLoginFlow({
          flow: currentFlow.id,
          updateLoginFlowBody: {
            method: 'oidc',
            provider: providerNode.attributes.value,
            csrf_token: csrfToken,
          },
        });
      } else {
        await frontend.updateRegistrationFlow({
          flow: currentFlow.id,
          updateRegistrationFlowBody: {
            method: 'oidc',
            provider: providerNode.attributes.value,
            csrf_token: csrfToken,
          },
        });
      }
    } catch (err: unknown) {
      const oryError = err as OryErrorResponse;

      if (oryError.response?.status === 422 && oryError.response?.data?.redirect_browser_to) {
        window.location.href = oryError.response.data.redirect_browser_to;
        return;
      }

      // If it's any other type of error, treat it as a failure.
      console.error('OIDC error:', err);
    } finally {
      setIsOidcLoading(false);
    }
  };

  return { oidcProviders, isOidcLoading, handleOidcLogin, extractProviders };
}

// Component
interface OidcProviderProps {
  flow: () => LoginFlow | RegistrationFlow | null;
  getCsrfToken: () => string;
  flowType?: 'login' | 'registration';
  oidcProviders: () => OryNode[];
  isOidcLoading: () => boolean;
  handleOidcLogin: (providerNode: OryNode) => Promise<void>;
}

const getProviderIcon = (provider: string) => {
  const iconProps = { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'currentColor' };

  // Clean the provider name by removing suffix after hyphen
  const cleanProvider = provider.split('-')[0].toLowerCase();

  switch (cleanProvider) {
    case 'google':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      );
    case 'github':
      return (
        <svg {...iconProps}>
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case 'microsoft':
      return (
        <svg {...iconProps}>
          <path
            d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
            fill="#00BCF2"
          />
        </svg>
      );
    case 'apple':
      return (
        <svg {...iconProps}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
        </svg>
      );
  }
};

const formatProviderName = (provider: string) => {
  // Remove any suffix after hyphen (e.g., "google-rdxKuYKL" becomes "google")
  const cleanProvider = provider.split('-')[0];
  return cleanProvider.charAt(0).toUpperCase() + cleanProvider.slice(1);
};

export default function OidcProvider(props: OidcProviderProps) {
  return (
    <Show when={props.oidcProviders().length > 0}>
      <div class="flex flex-col gap-3">
        <For each={props.oidcProviders()}>
          {(providerNode) => {
            const provider = providerNode.attributes?.value || '';
            const isDisabled = props.isOidcLoading();

            return (
              <Button
                variant="outline"
                class="w-full flex items-center justify-center gap-2 h-10"
                disabled={isDisabled}
                onClick={() => props.handleOidcLogin(providerNode)}
              >
                <div class="flex items-center gap-2 whitespace-nowrap">
                  {getProviderIcon(provider)}
                  <span>
                    {isDisabled ? 'Connecting...' : `Continue with ${formatProviderName(provider)}`}
                  </span>
                </div>
              </Button>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
