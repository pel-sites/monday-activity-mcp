/**
 * @fileoverview Domain types - shapes returned by MCP tools
 * These represent what the tools return to the AI
 */

/**
 * Column metadata for schema info
 * @typedef {Object} ColumnInfo
 * @property {string} name
 * @property {string} type
 */

/**
 * Table/view metadata for schema info
 * @typedef {Object} TableSchema
 * @property {string} name
 * @property {'table' | 'view'} type
 * @property {ColumnInfo[]} columns
 */

/**
 * Response from get_schema tool
 * @typedef {Object} GetSchemaResponse
 * @property {TableSchema[]} tables
 * @property {TableSchema[]} views
 */

/**
 * Input for run_query tool
 * @typedef {Object} RunQueryInput
 * @property {string} sql
 */

/**
 * Response from run_query tool
 * @typedef {Object} RunQueryResponse
 * @property {string[]} columns
 * @property {Object[]} rows
 * @property {number} rowCount
 */

/**
 * Error response from run_query tool
 * @typedef {Object} RunQueryError
 * @property {string} error
 */

/**
 * User metrics data
 * @typedef {Object} UserMetrics
 * @property {number} total_actions
 * @property {number} items_created
 * @property {number} days_active
 * @property {number} workspaces_touched
 * @property {number} boards_touched
 */

/**
 * User rankings across metrics
 * @typedef {Object} UserRankings
 * @property {number} total_actions
 * @property {number} items_created
 * @property {number} days_active
 * @property {number} workspaces_touched
 * @property {number} boards_touched
 */

/**
 * Single user with metrics and rankings
 * @typedef {Object} UserWithMetrics
 * @property {string} user_id
 * @property {UserMetrics} metrics
 * @property {UserRankings} rankings
 */

/**
 * Response from get_user_metrics tool
 * @typedef {Object} GetUserMetricsResponse
 * @property {UserWithMetrics[]} users
 * @property {number} userCount
 */

export {};
