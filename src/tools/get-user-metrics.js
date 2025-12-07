import { getDb } from '../lib/db.js';

export function getUserMetrics() {
  const db = getDb();

  const usersData = db
    .prepare(
      `
      SELECT
        user_id,
        COUNT(*) as total_actions,
        SUM(CASE WHEN event = 'create_pulse' THEN 1 ELSE 0 END) as items_created,
        COUNT(DISTINCT DATE(created_at)) as days_active,
        COUNT(DISTINCT workspace_name) as workspaces_touched,
        COUNT(DISTINCT board_id) as boards_touched
      FROM activity
      WHERE user_id IS NOT NULL AND user_id != '' AND user_id != '-4'
      GROUP BY user_id
      ORDER BY total_actions DESC
    `
    )
    .all();

  const users = usersData.map((user, _, arr) => {
    const metrics = {
      total_actions: user.total_actions,
      items_created: user.items_created,
      days_active: user.days_active,
      workspaces_touched: user.workspaces_touched,
      boards_touched: user.boards_touched,
    };

    const rankings = {
      total_actions: computeRank(arr, user, 'total_actions'),
      items_created: computeRank(arr, user, 'items_created'),
      days_active: computeRank(arr, user, 'days_active'),
      workspaces_touched: computeRank(arr, user, 'workspaces_touched'),
      boards_touched: computeRank(arr, user, 'boards_touched'),
    };

    return {
      user_id: user.user_id,
      metrics,
      rankings,
    };
  });

  return {
    users,
    userCount: users.length,
  };
}

function computeRank(arr, user, field) {
  const sorted = [...arr].sort((a, b) => b[field] - a[field]);
  return sorted.findIndex((u) => u.user_id === user.user_id) + 1;
}
