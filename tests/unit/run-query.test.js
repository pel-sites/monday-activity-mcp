import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { setDb, closeDb } from '../../src/lib/db.js';
import { runQuery } from '../../src/tools/run-query.js';
import { RunQueryResponseSchema } from '../../src/schemas/index.js';
import { createTestDb, seedTestData } from '../fixtures/test-db.js';

describe('runQuery', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
    seedTestData(testDb);
    setDb(testDb);
  });

  afterEach(() => {
    closeDb();
  });

  describe('valid queries', () => {
    it('executes a simple SELECT query', () => {
      const result = runQuery({ sql: 'SELECT * FROM activity' });
      assert.ok(!result.error);
      assert.ok(Array.isArray(result.columns));
      assert.ok(Array.isArray(result.rows));
      assert.strictEqual(result.rowCount, 7);
    });

    it('returns correct columns', () => {
      const result = runQuery({ sql: 'SELECT user_id, event FROM activity LIMIT 1' });
      assert.deepStrictEqual(result.columns, ['user_id', 'event']);
    });

    it('handles lowercase select', () => {
      const result = runQuery({ sql: 'select * from activity limit 1' });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 1);
    });

    it('queries views correctly', () => {
      const result = runQuery({ sql: 'SELECT * FROM activity_by_user' });
      assert.ok(!result.error);
      assert.ok(result.rowCount > 0);
      assert.ok(result.columns.includes('user_id'));
      assert.ok(result.columns.includes('total_actions'));
    });

    it('returns empty result for no matches', () => {
      const result = runQuery({ sql: "SELECT * FROM activity WHERE user_id = 'nonexistent'" });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 0);
      assert.deepStrictEqual(result.rows, []);
    });

    it('handles WHERE clauses', () => {
      const result = runQuery({ sql: "SELECT * FROM activity WHERE user_id = 'user1'" });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 4);
    });

    it('handles aggregate functions', () => {
      const result = runQuery({ sql: 'SELECT COUNT(*) as count FROM activity' });
      assert.ok(!result.error);
      assert.strictEqual(result.rows[0].count, 7);
    });

    it('handles GROUP BY', () => {
      const result = runQuery({ sql: 'SELECT user_id, COUNT(*) as count FROM activity GROUP BY user_id' });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 3);
    });

    it('handles ORDER BY', () => {
      const result = runQuery({ sql: 'SELECT user_id FROM activity ORDER BY created_at ASC LIMIT 1' });
      assert.ok(!result.error);
      assert.strictEqual(result.rows[0].user_id, 'user1');
    });

    it('validates against RunQueryResponseSchema', () => {
      const result = runQuery({ sql: 'SELECT * FROM activity LIMIT 2' });
      const validation = RunQueryResponseSchema.safeParse(result);
      assert.strictEqual(validation.success, true);
    });
  });

  describe('invalid queries', () => {
    it('rejects INSERT statements', () => {
      const result = runQuery({ sql: "INSERT INTO activity VALUES (100, '2024-01-01', 'test', 'item', 'user1', 'acc1', 'ws1', 'Workspace', 'b1', 'Board', 'i1', 'Item', null, null, null, '{}')" });
      assert.ok(result.error);
      assert.ok(result.error.includes('Query not allowed'));
    });

    it('rejects UPDATE statements', () => {
      const result = runQuery({ sql: "UPDATE activity SET event = 'test'" });
      assert.ok(result.error);
    });

    it('rejects DELETE statements', () => {
      const result = runQuery({ sql: 'DELETE FROM activity' });
      assert.ok(result.error);
    });

    it('rejects DROP statements', () => {
      const result = runQuery({ sql: 'DROP TABLE activity' });
      assert.ok(result.error);
    });

    it('rejects CREATE statements', () => {
      const result = runQuery({ sql: 'CREATE TABLE test (id INTEGER)' });
      assert.ok(result.error);
    });

    it('rejects ALTER statements', () => {
      const result = runQuery({ sql: 'ALTER TABLE activity ADD COLUMN test TEXT' });
      assert.ok(result.error);
    });

    it('rejects TRUNCATE statements', () => {
      const result = runQuery({ sql: 'TRUNCATE TABLE activity' });
      assert.ok(result.error);
    });

    it('rejects SELECT with embedded DELETE', () => {
      const result = runQuery({ sql: 'SELECT * FROM activity; DELETE FROM activity' });
      assert.ok(result.error);
    });

    it('returns error for invalid SQL syntax', () => {
      const result = runQuery({ sql: 'SELECT * FORM activity' });
      assert.ok(result.error);
    });

    it('returns error for non-existent table', () => {
      const result = runQuery({ sql: 'SELECT * FROM nonexistent_table' });
      assert.ok(result.error);
    });
  });

  describe('edge cases', () => {
    it('handles queries with special characters in strings', () => {
      const result = runQuery({ sql: "SELECT * FROM activity WHERE user_id = 'user''s'" });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 0);
    });

    it('handles LIMIT clause', () => {
      const result = runQuery({ sql: 'SELECT * FROM activity LIMIT 3' });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 3);
    });

    it('handles OFFSET clause', () => {
      const result = runQuery({ sql: 'SELECT * FROM activity LIMIT 2 OFFSET 5' });
      assert.ok(!result.error);
      assert.strictEqual(result.rowCount, 2);
    });
  });
});
