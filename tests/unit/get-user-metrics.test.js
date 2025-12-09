import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { setDb, closeDb } from '../../src/lib/db.js';
import { getUserMetrics } from '../../src/tools/get-user-metrics.js';
import { GetUserMetricsResponseSchema } from '../../src/schemas/index.js';
import { createTestDb, seedTestData } from '../fixtures/test-db.js';
import { setUsersData, resetUsers } from '../../src/lib/users.js';

describe('getUserMetrics', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
    seedTestData(testDb);
    setDb(testDb);
    resetUsers();
  });

  afterEach(() => {
    closeDb();
    resetUsers();
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

    it('includes user_name property for each user', () => {
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.ok('user_name' in user);
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

  describe('user names', () => {
    it('returns user_name when user mapping exists', () => {
      setUsersData({ user1: 'Test User One', user2: 'Test User Two' });
      const result = getUserMetrics();
      const user1 = result.users.find((u) => u.user_id === 'user1');
      const user2 = result.users.find((u) => u.user_id === 'user2');
      assert.strictEqual(user1.user_name, 'Test User One');
      assert.strictEqual(user2.user_name, 'Test User Two');
    });

    it('returns null for user_name when no mapping exists', () => {
      setUsersData({});
      const result = getUserMetrics();
      for (const user of result.users) {
        assert.strictEqual(user.user_name, null);
      }
    });
  });

  describe('activeOnly filter', () => {
    it('returns all users when activeOnly is false', () => {
      setUsersData({ user1: 'Test User One' });
      const result = getUserMetrics({ activeOnly: false });
      assert.strictEqual(result.userCount, 3);
    });

    it('returns only active users when activeOnly is true', () => {
      setUsersData({ user1: 'Test User One', user3: 'Test User Three' });
      const result = getUserMetrics({ activeOnly: true });
      assert.strictEqual(result.userCount, 2);
      const userIds = result.users.map((u) => u.user_id);
      assert.ok(userIds.includes('user1'));
      assert.ok(userIds.includes('user3'));
      assert.ok(!userIds.includes('user2'));
    });

    it('returns empty array when no active users', () => {
      setUsersData({});
      const result = getUserMetrics({ activeOnly: true });
      assert.strictEqual(result.userCount, 0);
      assert.deepStrictEqual(result.users, []);
    });

    it('recalculates rankings for filtered users', () => {
      setUsersData({ user1: 'Test User One', user3: 'Test User Three' });
      const result = getUserMetrics({ activeOnly: true });
      const user1 = result.users.find((u) => u.user_id === 'user1');
      const user3 = result.users.find((u) => u.user_id === 'user3');
      assert.strictEqual(user1.rankings.total_actions, 1);
      assert.strictEqual(user3.rankings.total_actions, 2);
    });
  });
});
