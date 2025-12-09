import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  GetSchemaResponseSchema,
  RunQueryInputSchema,
  RunQueryResponseSchema,
  GetUserMetricsResponseSchema,
} from '../../src/schemas/index.js';

describe('GetSchemaResponseSchema', () => {
  it('validates a valid schema response', () => {
    const valid = {
      tables: [
        {
          name: 'activity',
          type: 'table',
          columns: [
            { name: 'id', type: 'INTEGER' },
            { name: 'event', type: 'TEXT' },
          ],
        },
      ],
      views: [
        {
          name: 'activity_by_user',
          type: 'view',
          columns: [
            { name: 'user_id', type: 'TEXT' },
            { name: 'total_actions', type: 'INTEGER' },
          ],
        },
      ],
    };

    const result = GetSchemaResponseSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('rejects invalid type value', () => {
    const invalid = {
      tables: [
        {
          name: 'activity',
          type: 'invalid',
          columns: [],
        },
      ],
      views: [],
    };

    const result = GetSchemaResponseSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });
});

describe('RunQueryInputSchema', () => {
  it('accepts valid SELECT query', () => {
    const valid = { sql: 'SELECT * FROM activity' };
    const result = RunQueryInputSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('accepts SELECT with lowercase', () => {
    const valid = { sql: 'select * from activity' };
    const result = RunQueryInputSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('rejects INSERT statement', () => {
    const invalid = { sql: 'INSERT INTO activity VALUES (1)' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects UPDATE statement', () => {
    const invalid = { sql: 'UPDATE activity SET event = "test"' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects DELETE statement', () => {
    const invalid = { sql: 'DELETE FROM activity' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects DROP statement', () => {
    const invalid = { sql: 'DROP TABLE activity' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects CREATE statement', () => {
    const invalid = { sql: 'CREATE TABLE test (id INT)' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects ALTER statement', () => {
    const invalid = { sql: 'ALTER TABLE activity ADD COLUMN test TEXT' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects TRUNCATE statement', () => {
    const invalid = { sql: 'TRUNCATE TABLE activity' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects SELECT with embedded DELETE', () => {
    const invalid = { sql: 'SELECT * FROM activity; DELETE FROM activity' };
    const result = RunQueryInputSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });
});

describe('RunQueryResponseSchema', () => {
  it('validates a valid query response', () => {
    const valid = {
      columns: ['user_id', 'total_actions'],
      rows: [
        { user_id: '123', total_actions: 50 },
        { user_id: '456', total_actions: 30 },
      ],
      rowCount: 2,
    };

    const result = RunQueryResponseSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates empty result', () => {
    const valid = {
      columns: ['user_id'],
      rows: [],
      rowCount: 0,
    };

    const result = RunQueryResponseSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('rejects negative rowCount', () => {
    const invalid = {
      columns: [],
      rows: [],
      rowCount: -1,
    };

    const result = RunQueryResponseSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });
});

describe('GetUserMetricsResponseSchema', () => {
  it('validates a valid metrics response', () => {
    const valid = {
      users: [
        {
          user_id: '12345',
          user_name: 'Test User',
          metrics: {
            total_actions: 150,
            items_created: 45,
            days_active: 30,
            workspaces_touched: 3,
            boards_touched: 12,
          },
          rankings: {
            total_actions: 1,
            items_created: 2,
            days_active: 1,
            workspaces_touched: 3,
            boards_touched: 1,
          },
        },
      ],
      userCount: 1,
    };

    const result = GetUserMetricsResponseSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('validates empty users array', () => {
    const valid = {
      users: [],
      userCount: 0,
    };

    const result = GetUserMetricsResponseSchema.safeParse(valid);
    assert.strictEqual(result.success, true);
  });

  it('rejects zero ranking', () => {
    const invalid = {
      users: [
        {
          user_id: '12345',
          user_name: 'Test User',
          metrics: {
            total_actions: 150,
            items_created: 45,
            days_active: 30,
            workspaces_touched: 3,
            boards_touched: 12,
          },
          rankings: {
            total_actions: 0,
            items_created: 1,
            days_active: 1,
            workspaces_touched: 1,
            boards_touched: 1,
          },
        },
      ],
      userCount: 1,
    };

    const result = GetUserMetricsResponseSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });

  it('rejects negative metrics', () => {
    const invalid = {
      users: [
        {
          user_id: '12345',
          user_name: 'Test User',
          metrics: {
            total_actions: -1,
            items_created: 45,
            days_active: 30,
            workspaces_touched: 3,
            boards_touched: 12,
          },
          rankings: {
            total_actions: 1,
            items_created: 1,
            days_active: 1,
            workspaces_touched: 1,
            boards_touched: 1,
          },
        },
      ],
      userCount: 1,
    };

    const result = GetUserMetricsResponseSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
  });
});
