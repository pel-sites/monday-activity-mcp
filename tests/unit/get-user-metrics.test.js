import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { setDb, closeDb } from '../../src/lib/db.js';
import { getUserMetrics } from '../../src/tools/get-user-metrics.js';
import { GetUserMetricsResponseSchema } from '../../src/schemas/index.js';
import { createTestDb, seedTestData } from '../fixtures/test-db.js';

describe('getUserMetrics', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
    seedTestData(testDb);
    setDb(testDb);
  });

  afterEach(() => {
    closeDb();
  });

  describe('basic functionality', () => {
    it('returns users array and userCount', () => {
      const result = getUserMetrics();
      assert.ok(Array.isArray(result.users));
      assert.strictEqual(typeof result.userCount, 'number');
    });

    it('returns correct number of users', () => {
      const result = getUserMetrics();
      assert.strictEqual(result.userCount, 3);
      assert.strictEqual(result.users.length, 3);
    });

    it('includes user_id for each user', () => {
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.ok(user.user_id);
      }
    });

    it('includes metrics object for each user', () => {
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.ok(user.metrics);
        assert.strictEqual(typeof user.metrics.total_actions, 'number');
        assert.strictEqual(typeof user.metrics.items_created, 'number');
        assert.strictEqual(typeof user.metrics.days_active, 'number');
        assert.strictEqual(typeof user.metrics.workspaces_touched, 'number');
        assert.strictEqual(typeof user.metrics.boards_touched, 'number');
      }
    });

    it('includes rankings object for each user', () => {
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.ok(user.rankings);
        assert.strictEqual(typeof user.rankings.total_actions, 'number');
        assert.strictEqual(typeof user.rankings.items_created, 'number');
        assert.strictEqual(typeof user.rankings.days_active, 'number');
        assert.strictEqual(typeof user.rankings.workspaces_touched, 'number');
        assert.strictEqual(typeof user.rankings.boards_touched, 'number');
      }
    });
  });

  describe('metrics calculation', () => {
    it('calculates total_actions correctly', () => {
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      assert.strictEqual(user1.metrics.total_actions, 4);
    });

    it('calculates items_created correctly', () => {
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      assert.strictEqual(user1.metrics.items_created, 2);
    });

    it('calculates days_active correctly', () => {
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      assert.strictEqual(user1.metrics.days_active, 3);
    });

    it('calculates workspaces_touched correctly', () => {
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      assert.strictEqual(user1.metrics.workspaces_touched, 2);
    });

    it('calculates boards_touched correctly', () => {
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      assert.strictEqual(user1.metrics.boards_touched, 2);
    });
  });

  describe('rankings', () => {
    it('ranks users correctly by total_actions', () => {
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      const user2 = result.users.find((u) => u.user_id === 'user2');
      const user3 = result.users.find((u) => u.user_id === 'user3');

      assert.strictEqual(user1.rankings.total_actions, 1);
      assert.strictEqual(user2.rankings.total_actions, 2);
      assert.strictEqual(user3.rankings.total_actions, 3);
    });

    it('rankings start at 1', () => {
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.ok(user.rankings.total_actions >= 1);
        assert.ok(user.rankings.items_created >= 1);
        assert.ok(user.rankings.days_active >= 1);
        assert.ok(user.rankings.workspaces_touched >= 1);
        assert.ok(user.rankings.boards_touched >= 1);
      }
    });

    it('rankings do not exceed user count', () => {
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.ok(user.rankings.total_actions <= result.userCount);
        assert.ok(user.rankings.items_created <= result.userCount);
        assert.ok(user.rankings.days_active <= result.userCount);
        assert.ok(user.rankings.workspaces_touched <= result.userCount);
        assert.ok(user.rankings.boards_touched <= result.userCount);
      }
    });
  });

  describe('schema validation', () => {
    it('validates against GetUserMetricsResponseSchema', () => {
      const result = getUserMetrics();
      const validation = GetUserMetricsResponseSchema.safeParse(result);
      assert.strictEqual(validation.success, true);
    });
  });

  describe('empty database', () => {
    it('handles empty database', () => {
      const emptyDb = createTestDb();
      setDb(emptyDb);
      const result = getUserMetrics();
      assert.strictEqual(result.userCount, 0);
      assert.deepStrictEqual(result.users, []);
    });
  });

  describe('ordering', () => {
    it('returns users ordered by total_actions descending', () => {
      const result = getUserMetrics();
      for (let i = 0; i < result.users.length - 1; i++) {
        assert.ok(
          result.users[i].metrics.total_actions >= result.users[i + 1].metrics.total_actions
        );
      }
    });
  });
});
