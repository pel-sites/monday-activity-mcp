import { z } from 'zod';

const DISALLOWED_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'ALTER',
  'TRUNCATE',
];

export const RunQueryInputSchema = z.object({
  sql: z.string().refine(
    (sql) => {
      const upper = sql.toUpperCase().trim();
      if (!upper.startsWith('SELECT')) {
        return false;
      }
      for (const keyword of DISALLOWED_KEYWORDS) {
        if (upper.includes(keyword)) {
          return false;
        }
      }
      return true;
    },
    { message: 'Query not allowed: only SELECT statements permitted' }
  ),
});

export const RunQueryResponseSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.record(z.unknown())),
  rowCount: z.number().int().nonnegative(),
});

export const RunQueryErrorSchema = z.object({
  error: z.string(),
});
