/**
 * Business Manager Tools
 *
 * MCP tools for Meta Business Manager operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all business-related tools
 */
export function registerBusinessTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Businesses
  // ===========================================================================
  server.tool(
    'metaads_list_businesses',
    `List businesses accessible to the authenticated user.

Returns a paginated list of Business Manager accounts.

Args:
  - limit: Number of businesses to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - format: Response format ('json' or 'markdown')

Returns:
  List of businesses with id, name, verification_status, etc.`,
    {
      limit: z.number().int().min(1).max(100).default(25).describe('Number of businesses to return'),
      after: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, after, format }) => {
      try {
        const result = await client.getBusinesses({ limit, after });
        return formatResponse(result, format, 'businesses');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Business
  // ===========================================================================
  server.tool(
    'metaads_get_business',
    `Get details for a specific business.

Args:
  - businessId: The business ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Business details including name, created_time, verification_status, primary_page, etc.`,
    {
      businessId: z.string().describe('Business ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ businessId, format }) => {
      try {
        const business = await client.getBusiness(businessId);
        return formatResponse(business, format, 'business');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Business Ad Accounts
  // ===========================================================================
  server.tool(
    'metaads_list_business_ad_accounts',
    `List ad accounts owned by a business.

Returns a paginated list of ad accounts that belong to the specified business.

Args:
  - businessId: The business ID (required)
  - limit: Number of ad accounts to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - format: Response format ('json' or 'markdown')

Returns:
  List of ad accounts with id, name, status, currency, etc.`,
    {
      businessId: z.string().describe('Business ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of ad accounts to return'),
      after: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ businessId, limit, after, format }) => {
      try {
        const result = await client.listBusinessAdAccounts(businessId, { limit, after });
        return formatResponse(result, format, 'ad_accounts');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
