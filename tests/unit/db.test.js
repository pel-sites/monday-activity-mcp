import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { getDb, setDb, closeDb } from '../../src/lib/db.js';
import { createTestDb } from '../fixtures/test-db.js';

describe('db module', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
    setDb(testDb);
  });

  afterEach(() => {
    closeDb();
  });

  describe('getDb', () => {
    it('returns the database instance', () => {
      const db = getDb();
      assert.strictEqual(db, testDb);
    });

    it('returns the same instance on multiple calls', () => {
      const db1 = getDb();
      const db2 = getDb();
      assert.strictEqual(db1, db2);
    });
  });

  describe('setDb', () => {
    it('sets a custom database instance', () => {
      const customDb = createTestDb();
      setDb(customDb);
      const db = getDb();
      assert.strictEqual(db, customDb);
      customDb.close();
    });
  });

  describe('closeDb', () => {
    it('closes and clears the database instance', () => {
      getDb();
      closeDb();
      const newDb = createTestDb();
      setDb(newDb);
      const db = getDb();
      assert.strictEqual(db, newDb);
    });

    it('handles multiple close calls gracefully', () => {
      closeDb();
      closeDb();
      assert.ok(true);
    });
  });

  describe('database operations', () => {
    it('can execute queries on the test database', () => {
      const db = getDb();
      const result = db.prepare('SELECT 1 as value').get();
      assert.strictEqual(result.value, 1);
    });

    it('has the activity table', () => {
      const db = getDb();
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='activity'")
        .all();
      assert.strictEqual(tables.length, 1);
    });

    it('has all required views', () => {
      const db = getDb();
      const views = db
        .prepare("SELECT name FROM sqlite_master WHERE type='view'")
        .all();
      const viewNames = views.map((v) => v.name);

      assert.ok(viewNames.includes('activity_by_user'));
      assert.ok(viewNames.includes('activity_by_day'));
      assert.ok(viewNames.includes('activity_by_workspace'));
      assert.ok(viewNames.includes('activity_by_board'));
      assert.ok(viewNames.includes('event_summary'));
    });
  });
});
