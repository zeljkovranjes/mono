import { z } from 'zod';

export const clientEnvSchema = z.object({
  VITE_ROOT_DOMAIN: z.string().url(),
  VITE_ORY_SDK_URL: z.string().url(),
  VITE_KRATOS_PUBLIC_URL: z.string().url().optional(),
  VITE_KRATOS_BROWSER_URL: z.string().url().optional(),
  VITE_KRATOS_ADMIN_URL: z.string().url().optional(),
  VITE_HYDRA_ADMIN_URL: z.string().url().optional(),
  VITE_KETO_PUBLIC_URL: z.string().url().optional(),
});

export type IClientEnvSchema = z.infer<typeof clientEnvSchema>;
