import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { setDb, closeDb } from '../../src/lib/db.js';
import { getSchema } from '../../src/tools/get-schema.js';
import { runQuery } from '../../src/tools/run-query.js';
import { getUserMetrics } from '../../src/tools/get-user-metrics.js';
import { createTestDb, seedTestData } from '../fixtures/test-db.js';

const toolDefinitions = [
  {
    name: 'get_schema',
    description:
      'Returns available tables, views, and their columns from the Monday.com activity database. Use this to understand what data is available before querying.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'run_query',
    description:
      'Executes a read-only SQL query against the Monday.com activity database. Only SELECT statements are allowed.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'The SQL SELECT query to execute',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'get_user_metrics',
    description:
      'Returns comparative metrics for all users with rankings across total actions, items created, days active, workspaces touched, and boards touched.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

function handleToolCall(name, args) {
  switch (name) {
    case 'get_schema': {
      const result = getSchema();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'run_query': {
      const result = runQuery(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    case 'get_user_metrics': {
      const result = getUserMetrics();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

describe('MCP Protocol Integration', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
    seedTestData(testDb);
    setDb(testDb);
  });

  afterEach(() => {
    closeDb();
  });

  describe('ListTools', () => {
    it('returns all three tools', () => {
      assert.strictEqual(toolDefinitions.length, 3);
    });

    it('includes get_schema tool', () => {
      const tool = toolDefinitions.find((t) => t.name === 'get_schema');
      assert.ok(tool);
      assert.ok(tool.description);
    });

    it('includes run_query tool with sql parameter', () => {
      const tool = toolDefinitions.find((t) => t.name === 'run_query');
      assert.ok(tool);
      assert.ok(tool.inputSchema.properties.sql);
      assert.ok(tool.inputSchema.required.includes('sql'));
    });

    it('includes get_user_metrics tool', () => {
      const tool = toolDefinitions.find((t) => t.name === 'get_user_metrics');
      assert.ok(tool);
    });
  });

  describe('CallTool - get_schema', () => {
    it('returns schema as JSON text content', () => {
      const result = handleToolCall('get_schema', {});

      assert.strictEqual(result.content.length, 1);
      assert.strictEqual(result.content[0].type, 'text');

      const parsed = JSON.parse(result.content[0].text);
      assert.ok(parsed.tables);
      assert.ok(parsed.views);
    });
  });

  describe('CallTool - run_query', () => {
    it('executes query and returns results as JSON text', () => {
      const result = handleToolCall('run_query', { sql: 'SELECT * FROM activity LIMIT 2' });

      assert.strictEqual(result.content.length, 1);
      assert.strictEqual(result.content[0].type, 'text');

      const parsed = JSON.parse(result.content[0].text);
      assert.ok(parsed.columns);
      assert.ok(parsed.rows);
      assert.strictEqual(parsed.rowCount, 2);
    });

    it('returns error for invalid query', () => {
      const result = handleToolCall('run_query', { sql: 'DELETE FROM activity' });

      const parsed = JSON.parse(result.content[0].text);
      assert.ok(parsed.error);
    });
  });

  describe('CallTool - get_user_metrics', () => {
    it('returns user metrics as JSON text', () => {
      const result = handleToolCall('get_user_metrics', {});

      assert.strictEqual(result.content.length, 1);
      assert.strictEqual(result.content[0].type, 'text');

      const parsed = JSON.parse(result.content[0].text);
      assert.ok(parsed.users);
      assert.strictEqual(parsed.userCount, 3);
    });
  });

  describe('CallTool - unknown tool', () => {
    it('throws error for unknown tool', () => {
      assert.throws(() => handleToolCall('unknown_tool', {}), /Unknown tool/);
    });
  });

  describe('End-to-end workflow', () => {
    it('can discover schema and then query data', () => {
      const schemaResult = handleToolCall('get_schema', {});
      const schema = JSON.parse(schemaResult.content[0].text);

      const activityTable = schema.tables.find((t) => t.name === 'activity');
      assert.ok(activityTable);

      const queryResult = handleToolCall('run_query', {
        sql: 'SELECT COUNT(*) as total FROM activity',
      });
      const queryData = JSON.parse(queryResult.content[0].text);
      assert.strictEqual(queryData.rows[0].total, 7);
    });

    it('can get user metrics and verify against raw query', () => {
      const metricsResult = handleToolCall('get_user_metrics', {});
      const metrics = JSON.parse(metricsResult.content[0].text);

      const queryResult = handleToolCall('run_query', {
        sql: 'SELECT COUNT(DISTINCT user_id) as count FROM activity',
      });
      const queryData = JSON.parse(queryResult.content[0].text);

      assert.strictEqual(metrics.userCount, queryData.rows[0].count);
    });

    it('can query specific user data after getting metrics', () => {
      const metricsResult = handleToolCall('get_user_metrics', {});
      const metrics = JSON.parse(metricsResult.content[0].text);

      const topUser = metrics.users[0];

      const queryResult = handleToolCall('run_query', {
        sql: `SELECT COUNT(*) as count FROM activity WHERE user_id = '${topUser.user_id}'`,
      });
      const queryData = JSON.parse(queryResult.content[0].text);

      assert.strictEqual(topUser.metrics.total_actions, queryData.rows[0].count);
    });
  });

  describe('MCP response format', () => {
    it('returns content array with text type for get_schema', () => {
      const result = handleToolCall('get_schema', {});
      assert.ok(Array.isArray(result.content));
      assert.strictEqual(result.content[0].type, 'text');
      assert.strictEqual(typeof result.content[0].text, 'string');
    });

    it('returns content array with text type for run_query', () => {
      const result = handleToolCall('run_query', { sql: 'SELECT 1 as value' });
      assert.ok(Array.isArray(result.content));
      assert.strictEqual(result.content[0].type, 'text');
      assert.strictEqual(typeof result.content[0].text, 'string');
    });

    it('returns content array with text type for get_user_metrics', () => {
      const result = handleToolCall('get_user_metrics', {});
      assert.ok(Array.isArray(result.content));
      assert.strictEqual(result.content[0].type, 'text');
      assert.strictEqual(typeof result.content[0].text, 'string');
    });

    it('returns valid JSON in all responses', () => {
      const schemaResult = handleToolCall('get_schema', {});
      const queryResult = handleToolCall('run_query', { sql: 'SELECT 1' });
      const metricsResult = handleToolCall('get_user_metrics', {});

      assert.doesNotThrow(() => JSON.parse(schemaResult.content[0].text));
      assert.doesNotThrow(() => JSON.parse(queryResult.content[0].text));
      assert.doesNotThrow(() => JSON.parse(metricsResult.content[0].text));
    });
  });
});
