import { getDb } from '../lib/db.js';

export function getUserMetrics() {
  const db = getDb();

  const usersData = db
    .prepare(
      `
      SELECT
        u.user_id,
        u.total_actions,
        u.items_created,
        COUNT(DISTINCT d.day) as days_active,
        COUNT(DISTINCT w.workspace_name) as workspaces_touched,
        COUNT(DISTINCT b.board_id) as boards_touched
      FROM activity_by_user u
      LEFT JOIN daily_user_activity d ON u.user_id = d.user_id
      LEFT JOIN user_workspace_activity w ON u.user_id = w.user_id
      LEFT JOIN user_board_activity b ON u.user_id = b.user_id
      GROUP BY u.user_id
      ORDER BY u.total_actions DESC
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
