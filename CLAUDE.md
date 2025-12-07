# Monday Activity MCP Server

MCP server exposing tools for AI to query and analyze Monday.com activity data.

## Other Considerations

Do only as I say and make no assumptions and be precise.

gh cli is set up for user ldraney or organization intelligent-staffing-systems or pel-sites.

Always when making or working from a new branch make sure there is an issue for the branch then make a git worktree in ~/worktrees.

Check your cwd. Git pull to make sure we are up to date with the latest default branch.

## Upstream Dependency

**Repo:** pel-sites/monday-activity-views
**Artifact:** monday.db (from GitHub release)

### Available Data Shapes

**Raw table:**
- `activity` (id, created_at, event, entity, user_id, account_id, workspace_id, workspace_name, board_id, board_name, item_id, item_name, column_id, column_title, group_id, data_json)

**Views:**
- `activity_by_user` (user_id, total_actions, items_created, updates, items_deleted, first_action, last_action)
- `activity_by_day` (day, total_actions, unique_users, items_created, updates)
- `activity_by_workspace` (workspace_id, workspace_name, total_actions, unique_users, boards_touched, first_action, last_action)
- `activity_by_board` (board_id, board_name, workspace_name, total_actions, unique_users, items_created, first_action, last_action)
- `event_summary` (event, count, unique_users, first_occurrence, last_occurrence)

## TDD Cycle

```
1. Define tool contracts in README.md
   ↓
2. JSDoc types (types/external.js, types/domain.js)
   ↓
3. Zod schemas for runtime validation
   ↓
4. Write FAILING tests
   ↓
5. Implement minimal code to pass
   ↓
6. Refactor while green
```

## Project Structure

```
monday-activity-mcp/
├── README.md              # Tool contracts, user stories
├── CLAUDE.md
├── package.json
├── db/
│   └── monday.db          # Fetched from upstream release, gitignored
├── src/
│   ├── types/
│   │   ├── external.js    # Upstream db shapes
│   │   └── domain.js      # Tool response shapes
│   ├── schemas/
│   │   └── *.js           # Zod schemas
│   ├── tools/
│   │   └── *.js           # MCP tool implementations
│   ├── lib/
│   │   └── db.js          # SQLite access
│   └── index.js           # MCP server entry
├── tests/
│   ├── unit/
│   └── integration/
└── scripts/
    └── fetch-db.sh        # Pulls db from upstream release
```

## Two-Tier Types

```
types/external.js   →   types/domain.js
(What db has)           (What tools return)
```

Transform at query boundary. Domain objects go to MCP tool responses.
