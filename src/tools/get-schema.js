import { getDb } from '../lib/db.js';

export function getSchema() {
  const db = getDb();

  const tablesAndViews = db
    .prepare(
      `SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name`
    )
    .all();

  const tables = [];
  const views = [];

  for (const item of tablesAndViews) {
    const columns = db.prepare(`PRAGMA table_info('${item.name}')`).all();
    const schema = {
      name: item.name,
      type: item.type,
      columns: columns.map((col) => ({
        name: col.name,
        type: col.type || 'TEXT',
      })),
    };

    if (item.type === 'table') {
      tables.push(schema);
    } else {
      views.push(schema);
    }
  }

  return { tables, views };
}
