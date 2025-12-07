import { z } from 'zod';

export const UserMetricsSchema = z.object({
  total_actions: z.number().int().nonnegative(),
  items_created: z.number().int().nonnegative(),
  days_active: z.number().int().nonnegative(),
  workspaces_touched: z.number().int().nonnegative(),
  boards_touched: z.number().int().nonnegative(),
});

export const UserRankingsSchema = z.object({
  total_actions: z.number().int().positive(),
  items_created: z.number().int().positive(),
  days_active: z.number().int().positive(),
  workspaces_touched: z.number().int().positive(),
  boards_touched: z.number().int().positive(),
});

export const UserWithMetricsSchema = z.object({
  user_id: z.string(),
  metrics: UserMetricsSchema,
  rankings: UserRankingsSchema,
});

export const GetUserMetricsResponseSchema = z.object({
  users: z.array(UserWithMetricsSchema),
  userCount: z.number().int().nonnegative(),
});
