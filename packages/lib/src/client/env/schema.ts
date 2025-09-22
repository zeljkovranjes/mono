import { z } from 'zod';

export const clientEnvSchema = z.object({
  VITE_ROOT_DOMAIN: z.url(),
  VITE_ORY_SDK_URL: z.url().optional(),
  VITE_KRATOS_PUBLIC_URL: z.url().optional(),
  VITE_KRATOS_BROWSER_URL: z.url().optional(),
  VITE_KRATOS_ADMIN_URL: z.url().optional(),
  VITE_HYDRA_ADMIN_URL: z.url().optional(),
  VITE_KETO_PUBLIC_URL: z.url().optional(),
});

export type IClientEnvSchema = z.infer<typeof clientEnvSchema>;
