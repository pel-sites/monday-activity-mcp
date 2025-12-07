import { getDb } from '../lib/db.js';
import { RunQueryInputSchema } from '../schemas/index.js';

export function runQuery(input) {
  const validation = RunQueryInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const db = getDb();
  try {
    const stmt = db.prepare(validation.data.sql);
    const rows = stmt.all();
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      columns,
      rows,
      rowCount: rows.length,
    };
  } catch (err) {
    return { error: err.message };
  }
}
