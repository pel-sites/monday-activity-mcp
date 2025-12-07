import { z } from 'zod';

const DISALLOWED_PATTERNS = [
  /\bINSERT\b/,
  /\bUPDATE\b/,
  /\bDELETE\b/,
  /\bDROP\b/,
  /\bCREATE\b/,
  /\bALTER\b/,
  /\bTRUNCATE\b/,
];

export const RunQueryInputSchema = z.object({
  sql: z.string().refine(
    (sql) => {
      const upper = sql.toUpperCase().trim();
      if (!upper.startsWith('SELECT')) {
        return false;
      }
      for (const pattern of DISALLOWED_PATTERNS) {
        if (pattern.test(upper)) {
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
