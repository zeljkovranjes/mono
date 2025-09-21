interface ImportMetaEnv {
  readonly VITE_ROOT_DOMAIN: string;
  readonly VITE_ORY_SDK_URL: string;
  readonly VITE_KRATOS_PUBLIC_URL?: string;
  readonly VITE_KRATOS_BROWSER_URL?: string;
  readonly VITE_KETO_PUBLIC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'test' | 'production';
    readonly ORY_ADMIN_API_TOKEN: string;
    readonly REMEMBER_CONSENT_SESSION_FOR_SECONDS: string;

    readonly COOKIE_SECRET: string;
    readonly CSRF_COOKIE_NAME: string;
    readonly CSRF_COOKIE_SECRET?: string;
    readonly DANGEROUSLY_DISABLE_SECURE_CSRF_COOKIES: 'true' | 'false';
    readonly MOCK_TLS_TERMINATION: 'true' | 'false';

    readonly API_SECRET_KEY: string;

    readonly STRIPE_SECRET_KEY: string;
    readonly STRIPE_WEBHOOK_SECRET: string;

    readonly POSTGRES_DATABASE_URL: string;

    readonly OTEL_EXPORTER_URL: string;

    readonly LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  }
}
