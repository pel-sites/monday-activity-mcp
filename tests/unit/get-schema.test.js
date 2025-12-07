import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { setDb, closeDb } from '../../src/lib/db.js';
import { getSchema } from '../../src/tools/get-schema.js';
import { GetSchemaResponseSchema } from '../../src/schemas/index.js';
import { createTestDb } from '../fixtures/test-db.js';

describe('getSchema', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDb();
    setDb(testDb);
  });

  afterEach(() => {
    closeDb();
  });

  it('returns tables and views arrays', () => {
    const result = getSchema();
    assert.ok(Array.isArray(result.tables));
    assert.ok(Array.isArray(result.views));
  });

  it('returns the activity table', () => {
    const result = getSchema();
    const activityTable = result.tables.find((t) => t.name === 'activity');
    assert.ok(activityTable);
    assert.strictEqual(activityTable.type, 'table');
  });

  it('returns correct columns for activity table', () => {
    const result = getSchema();
    const activityTable = result.tables.find((t) => t.name === 'activity');
    const columnNames = activityTable.columns.map((c) => c.name);

    assert.ok(columnNames.includes('id'));
    assert.ok(columnNames.includes('created_at'));
    assert.ok(columnNames.includes('event'));
    assert.ok(columnNames.includes('user_id'));
    assert.ok(columnNames.includes('workspace_id'));
    assert.ok(columnNames.includes('board_id'));
  });

  it('returns all expected views', () => {
    const result = getSchema();
    const viewNames = result.views.map((v) => v.name);

    assert.ok(viewNames.includes('activity_by_user'));
    assert.ok(viewNames.includes('activity_by_day'));
    assert.ok(viewNames.includes('activity_by_workspace'));
    assert.ok(viewNames.includes('activity_by_board'));
    assert.ok(viewNames.includes('event_summary'));
  });

  it('returns correct columns for activity_by_user view', () => {
    const result = getSchema();
    const view = result.views.find((v) => v.name === 'activity_by_user');
    const columnNames = view.columns.map((c) => c.name);

    assert.ok(columnNames.includes('user_id'));
    assert.ok(columnNames.includes('total_actions'));
    assert.ok(columnNames.includes('items_created'));
    assert.ok(columnNames.includes('updates'));
    assert.ok(columnNames.includes('items_deleted'));
    assert.ok(columnNames.includes('first_action'));
    assert.ok(columnNames.includes('last_action'));
  });

  it('sets type to view for views', () => {
    const result = getSchema();
    for (const view of result.views) {
      assert.strictEqual(view.type, 'view');
    }
  });

  it('validates against GetSchemaResponseSchema', () => {
    const result = getSchema();
    const validation = GetSchemaResponseSchema.safeParse(result);
    assert.strictEqual(validation.success, true);
  });

  it('excludes sqlite internal tables', () => {
    const result = getSchema();
    const allNames = [
      ...result.tables.map((t) => t.name),
      ...result.views.map((v) => v.name),
    ];

    for (const name of allNames) {
      assert.ok(!name.startsWith('sqlite_'));
    }
  });
});
