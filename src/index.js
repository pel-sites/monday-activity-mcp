import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getSchema } from './tools/get-schema.js';
import { runQuery } from './tools/run-query.js';
import { getUserMetrics } from './tools/get-user-metrics.js';

const server = new Server(
  {
    name: 'monday-activity-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
          'Returns comparative metrics for all users with rankings across total actions, items created, days active, workspaces touched, and boards touched. Includes user names when available.',
        inputSchema: {
          type: 'object',
          properties: {
            activeOnly: {
              type: 'boolean',
              description:
                'If true, only include users who are currently active in the Monday.com account. Default: false.',
            },
          },
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

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
      const result = getUserMetrics(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
