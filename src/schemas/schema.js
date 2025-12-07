import { z } from 'zod';

export const ColumnInfoSchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const TableSchemaSchema = z.object({
  name: z.string(),
  type: z.enum(['table', 'view']),
  columns: z.array(ColumnInfoSchema),
});

export const GetSchemaResponseSchema = z.object({
  tables: z.array(TableSchemaSchema),
  views: z.array(TableSchemaSchema),
});
