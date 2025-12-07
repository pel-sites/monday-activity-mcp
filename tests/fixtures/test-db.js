import Database from 'better-sqlite3';

export function createTestDb() {
  const db = new Database(':memory:');

  db.exec(`
    CREATE TABLE activity (
      id INTEGER PRIMARY KEY,
      created_at TEXT,
      event TEXT,
      entity TEXT,
      user_id TEXT,
      account_id TEXT,
      workspace_id TEXT,
      workspace_name TEXT,
      board_id TEXT,
      board_name TEXT,
      item_id TEXT,
      item_name TEXT,
      column_id TEXT,
      column_title TEXT,
      group_id TEXT,
      data_json TEXT
    );

    CREATE VIEW activity_by_user AS
    SELECT
      user_id,
      COUNT(*) as total_actions,
      SUM(CASE WHEN event = 'create_pulse' THEN 1 ELSE 0 END) as items_created,
      SUM(CASE WHEN event = 'update_column_value' THEN 1 ELSE 0 END) as updates,
      SUM(CASE WHEN event = 'delete_pulse' THEN 1 ELSE 0 END) as items_deleted,
      MIN(created_at) as first_action,
      MAX(created_at) as last_action
    FROM activity
    GROUP BY user_id;

    CREATE VIEW activity_by_day AS
    SELECT
      DATE(created_at) as day,
      COUNT(*) as total_actions,
      COUNT(DISTINCT user_id) as unique_users,
      SUM(CASE WHEN event = 'create_pulse' THEN 1 ELSE 0 END) as items_created,
      SUM(CASE WHEN event = 'update_column_value' THEN 1 ELSE 0 END) as updates
    FROM activity
    GROUP BY DATE(created_at);

    CREATE VIEW activity_by_workspace AS
    SELECT
      workspace_id,
      workspace_name,
      COUNT(*) as total_actions,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT board_id) as boards_touched,
      MIN(created_at) as first_action,
      MAX(created_at) as last_action
    FROM activity
    GROUP BY workspace_id;

    CREATE VIEW activity_by_board AS
    SELECT
      board_id,
      board_name,
      workspace_name,
      COUNT(*) as total_actions,
      COUNT(DISTINCT user_id) as unique_users,
      SUM(CASE WHEN event = 'create_pulse' THEN 1 ELSE 0 END) as items_created,
      MIN(created_at) as first_action,
      MAX(created_at) as last_action
    FROM activity
    GROUP BY board_id;

    CREATE VIEW event_summary AS
    SELECT
      event,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users,
      MIN(created_at) as first_occurrence,
      MAX(created_at) as last_occurrence
    FROM activity
    GROUP BY event;
  `);

  return db;
}

export function seedTestData(db) {
  const insert = db.prepare(`
    INSERT INTO activity (created_at, event, entity, user_id, account_id, workspace_id, workspace_name, board_id, board_name, item_id, item_name, column_id, column_title, group_id, data_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const testData = [
    ['2024-01-15T10:00:00Z', 'create_pulse', 'item', 'user1', 'acc1', 'ws1', 'Workspace A', 'board1', 'Board 1', 'item1', 'Item 1', null, null, 'group1', '{}'],
    ['2024-01-15T11:00:00Z', 'update_column_value', 'item', 'user1', 'acc1', 'ws1', 'Workspace A', 'board1', 'Board 1', 'item1', 'Item 1', 'col1', 'Status', 'group1', '{}'],
    ['2024-01-16T09:00:00Z', 'create_pulse', 'item', 'user1', 'acc1', 'ws2', 'Workspace B', 'board2', 'Board 2', 'item2', 'Item 2', null, null, 'group2', '{}'],
    ['2024-01-16T10:00:00Z', 'create_pulse', 'item', 'user2', 'acc1', 'ws1', 'Workspace A', 'board1', 'Board 1', 'item3', 'Item 3', null, null, 'group1', '{}'],
    ['2024-01-16T11:00:00Z', 'update_column_value', 'item', 'user2', 'acc1', 'ws1', 'Workspace A', 'board1', 'Board 1', 'item3', 'Item 3', 'col1', 'Status', 'group1', '{}'],
    ['2024-01-17T08:00:00Z', 'delete_pulse', 'item', 'user1', 'acc1', 'ws1', 'Workspace A', 'board1', 'Board 1', 'item1', 'Item 1', null, null, 'group1', '{}'],
    ['2024-01-17T09:00:00Z', 'create_pulse', 'item', 'user3', 'acc1', 'ws1', 'Workspace A', 'board3', 'Board 3', 'item4', 'Item 4', null, null, 'group3', '{}'],
  ];

  for (const row of testData) {
    insert.run(...row);
  }
}
