# Monday Activity MCP Server

MCP server exposing tools for AI to query and analyze Monday.com activity data.

## Tools

### 1. `get_schema`

Returns available tables, views, and their columns. Enables AI to understand what data is available.

**Input:** None

**Returns:**
```json
{
  "tables": [
    {
      "name": "activity",
      "type": "table",
      "columns": [
        { "name": "id", "type": "INTEGER" },
        { "name": "created_at", "type": "TEXT" },
        { "name": "event", "type": "TEXT" },
        { "name": "entity", "type": "TEXT" },
        { "name": "user_id", "type": "TEXT" },
        { "name": "account_id", "type": "TEXT" },
        { "name": "workspace_id", "type": "TEXT" },
        { "name": "workspace_name", "type": "TEXT" },
        { "name": "board_id", "type": "TEXT" },
        { "name": "board_name", "type": "TEXT" },
        { "name": "item_id", "type": "TEXT" },
        { "name": "item_name", "type": "TEXT" },
        { "name": "column_id", "type": "TEXT" },
        { "name": "column_title", "type": "TEXT" },
        { "name": "group_id", "type": "TEXT" },
        { "name": "data_json", "type": "TEXT" }
      ]
    }
  ],
  "views": [
    {
      "name": "activity_by_user",
      "type": "view",
      "columns": [
        { "name": "user_id", "type": "TEXT" },
        { "name": "total_actions", "type": "INTEGER" },
        { "name": "items_created", "type": "INTEGER" },
        { "name": "updates", "type": "INTEGER" },
        { "name": "items_deleted", "type": "INTEGER" },
        { "name": "first_action", "type": "TEXT" },
        { "name": "last_action", "type": "TEXT" }
      ]
    }
  ]
}
```

**Example Use Case:**
- AI asks "What data do you have?" → Returns schema so AI knows what queries are possible

---

### 2. `run_query`

Executes a read-only SQL query against the database.

**Input:**
```json
{
  "sql": "SELECT * FROM activity_by_user LIMIT 10"
}
```

**Validation:**
- Only SELECT statements allowed
- Query must not contain: INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE

**Returns:**
```json
{
  "columns": ["user_id", "total_actions", "items_created", "updates", "items_deleted", "first_action", "last_action"],
  "rows": [
    {
      "user_id": "12345",
      "total_actions": 150,
      "items_created": 45,
      "updates": 80,
      "items_deleted": 5,
      "first_action": "2024-01-15T10:30:00Z",
      "last_action": "2024-03-20T14:22:00Z"
    }
  ],
  "rowCount": 1
}
```

**Error Response:**
```json
{
  "error": "Query not allowed: only SELECT statements permitted"
}
```

**Example Use Cases:**
- "Show me all activity from last week" → AI constructs appropriate SQL
- "Which boards have the most activity?" → AI queries activity_by_board view

---

### 3. `get_user_metrics`

Returns comparative metrics for all users with rankings.

**Input:** None

**Returns:**
```json
{
  "users": [
    {
      "user_id": "12345",
      "metrics": {
        "total_actions": 150,
        "items_created": 45,
        "days_active": 30,
        "workspaces_touched": 3,
        "boards_touched": 12
      },
      "rankings": {
        "total_actions": 1,
        "items_created": 2,
        "days_active": 1,
        "workspaces_touched": 3,
        "boards_touched": 1
      }
    }
  ],
  "userCount": 1
}
```

**Example Use Cases:**
- "Who is the most active user?" → Returns users sorted by total_actions rank
- "Compare user productivity" → AI can analyze rankings across metrics

## Data Source

Database is fetched from upstream release at `pel-sites/monday-activity-views`.

## Installation

```bash
npm install
./scripts/fetch-db.sh
```

## Usage

```bash
npm start
```
