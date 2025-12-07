/**
 * @fileoverview External types - shapes from upstream database
 * These represent what the SQLite database contains
 */

/**
 * Raw activity record from the database
 * @typedef {Object} ActivityRow
 * @property {number} id
 * @property {string} created_at
 * @property {string} event
 * @property {string} entity
 * @property {string} user_id
 * @property {string} account_id
 * @property {string} workspace_id
 * @property {string} workspace_name
 * @property {string} board_id
 * @property {string} board_name
 * @property {string} item_id
 * @property {string} item_name
 * @property {string} column_id
 * @property {string} column_title
 * @property {string} group_id
 * @property {string} data_json
 */

/**
 * activity_by_user view row
 * @typedef {Object} ActivityByUserRow
 * @property {string} user_id
 * @property {number} total_actions
 * @property {number} items_created
 * @property {number} updates
 * @property {number} items_deleted
 * @property {string} first_action
 * @property {string} last_action
 */

/**
 * activity_by_day view row
 * @typedef {Object} ActivityByDayRow
 * @property {string} day
 * @property {number} total_actions
 * @property {number} unique_users
 * @property {number} items_created
 * @property {number} updates
 */

/**
 * activity_by_workspace view row
 * @typedef {Object} ActivityByWorkspaceRow
 * @property {string} workspace_id
 * @property {string} workspace_name
 * @property {number} total_actions
 * @property {number} unique_users
 * @property {number} boards_touched
 * @property {string} first_action
 * @property {string} last_action
 */

/**
 * activity_by_board view row
 * @typedef {Object} ActivityByBoardRow
 * @property {string} board_id
 * @property {string} board_name
 * @property {string} workspace_name
 * @property {number} total_actions
 * @property {number} unique_users
 * @property {number} items_created
 * @property {string} first_action
 * @property {string} last_action
 */

/**
 * event_summary view row
 * @typedef {Object} EventSummaryRow
 * @property {string} event
 * @property {number} count
 * @property {number} unique_users
 * @property {string} first_occurrence
 * @property {string} last_occurrence
 */

/**
 * user_workspace_activity view row
 * @typedef {Object} UserWorkspaceActivityRow
 * @property {string} user_id
 * @property {string} workspace_name
 * @property {number} actions
 * @property {string} first_action
 * @property {string} last_action
 */

/**
 * daily_user_activity view row
 * @typedef {Object} DailyUserActivityRow
 * @property {string} day
 * @property {string} user_id
 * @property {number} actions
 */

/**
 * user_board_activity view row
 * @typedef {Object} UserBoardActivityRow
 * @property {string} user_id
 * @property {string} board_id
 * @property {string} board_name
 * @property {string} workspace_name
 * @property {number} actions
 * @property {number} items_created
 * @property {number} updates
 * @property {string} first_action
 * @property {string} last_action
 */

/**
 * SQLite table/view info from pragma
 * @typedef {Object} TableInfo
 * @property {number} cid
 * @property {string} name
 * @property {string} type
 * @property {number} notnull
 * @property {*} dflt_value
 * @property {number} pk
 */

export {};
