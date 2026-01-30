/**
 * Ad Account Tools
 *
 * MCP tools for Meta Ads account management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all ad account-related tools
 */
export function registerAccountTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Ad Accounts
  // ===========================================================================
  server.tool(
    'metaads_list_ad_accounts',
    `List all ad accounts accessible to the authenticated user.

Returns a paginated list of ad accounts with their status, currency, and timezone.

Args:
  - limit: Number of accounts to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of ad accounts with id, name, status, currency, timezone, etc.`,
    {
      limit: z.number().int().min(1).max(100).default(25).describe('Number of accounts to return'),
      after: z.string().optional().describe('Pagination cursor from previous response'),
      fields: z.string().optional().describe('Comma-separated list of fields to return'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ limit, after, fields, format }) => {
      try {
        const result = await client.listAdAccounts({ limit, after, fields });
        return formatResponse(result, format, 'ad_accounts');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad Account
  // ===========================================================================
  server.tool(
    'metaads_get_ad_account',
    `Get details for a specific ad account.

Args:
  - accountId: The ad account ID (with or without 'act_' prefix)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Ad account details including id, name, status, balance, currency, timezone, etc.`,
    {
      accountId: z.string().describe('Ad account ID (e.g., "act_123456789" or "123456789")'),
      fields: z.string().optional().describe('Comma-separated list of fields to return'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, fields, format }) => {
      try {
        const account = await client.getAdAccount(accountId, fields);
        return formatResponse(account, format, 'ad_account');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
