import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

// API Response Types
export const ApiResponseTypeSchema = z.enum(['success', 'error', 'warning', 'info']);

export const HttpStatusCodeSchema = z.union([
  z.literal(200),
  z.literal(201),
  z.literal(204),
  z.literal(400),
  z.literal(401),
  z.literal(403),
  z.literal(404),
  z.literal(409),
  z.literal(422),
  z.literal(429),
  z.literal(500),
  z.literal(502),
  z.literal(503),
]);

export const createApiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    messages: z
      .array(
        z.object({
          instance_ptr: z.string(),
          messages: z.array(
            z.object({
              text: z.string(),
              type: ApiResponseTypeSchema,
            }),
          ),
        }),
      )
      .optional(),
    meta: z.object({
      timestamp: z.iso.datetime(),
      request_id: z.uuid(),
      version: z.string().default('1.0'),
      code: HttpStatusCodeSchema.optional(),
    }),
  });

export function customApiResponse<T>(
  instance_ptr: string,
  message: string,
  type: z.infer<typeof ApiResponseTypeSchema>,
  code: z.infer<typeof HttpStatusCodeSchema>,
  data?: T,
) {
  return {
    success: type === 'success',
    data: data,
    messages: [
      {
        instance_ptr: instance_ptr,
        messages: [
          {
            text: message,
            type,
          },
        ],
      },
    ],
    meta: {
      timestamp: new Date().toISOString(),
      request_id: crypto.randomUUID(),
      version: '1.0',
      code,
    },
  };
}

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

export const createPaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  createApiResponse(
    z.object({
      items: z.array(itemSchema),
      pagination: PaginationMetaSchema,
    }),
  );

export const GatewayHeadersSchema = z.object();
/*
export const GatewayHeadersSchema = z.object({
  'x-organization-id': z.uuid().optional(),
  'x-user-id': z.uuid().optional(),
});
*/

export interface ApiContract {
  method: z.infer<typeof HttpMethodSchema>;
  path: string;
  schema: {
    description?: string;
    tags?: string[];
    headers?: z.ZodSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
    body?: z.ZodSchema;

    response: Record<number, z.ZodSchema>;
  };
}

export type InferRequest<T extends ApiContract> = {
  headers: T['schema']['headers'] extends z.ZodSchema ? z.infer<T['schema']['headers']> : undefined;
  params: T['schema']['params'] extends z.ZodSchema ? z.infer<T['schema']['params']> : undefined;
  query: T['schema']['query'] extends z.ZodSchema ? z.infer<T['schema']['query']> : undefined;
  body: T['schema']['body'] extends z.ZodSchema ? z.infer<T['schema']['body']> : undefined;
};

export type InferResponse<
  T extends ApiContract,
  Code extends keyof T['schema']['response'] = 200,
> = z.infer<T['schema']['response'][Code]>;
