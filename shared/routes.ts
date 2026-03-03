import { z } from "zod";
import { insertUserSchema, users, history } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  unauthorized: z.object({ message: z.string() }),
  badRequest: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() })
};

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  coins: z.number(),
  totalEarned: z.number(),
  dailyAdsWatched: z.number(),
  referralCode: z.string()
});

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: userResponseSchema,
        400: errorSchemas.badRequest
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: userResponseSchema,
        401: errorSchemas.unauthorized
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: userResponseSchema,
        401: errorSchemas.unauthorized
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  ads: {
    reward: {
      method: 'POST' as const,
      path: '/api/ads/reward' as const,
      responses: {
        200: z.object({ 
          message: z.string(), 
          coinsEarned: z.number(), 
          newBalance: z.number() 
        }),
        400: errorSchemas.badRequest,
        401: errorSchemas.unauthorized
      }
    }
  },
  history: {
    list: {
      method: 'GET' as const,
      path: '/api/history' as const,
      responses: {
        200: z.array(z.custom<typeof history.$inferSelect>()),
        401: errorSchemas.unauthorized
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
