/**
 * Product Catalog Tools
 *
 * MCP tools for Meta Ads product catalogs and product sets.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all catalog-related tools
 */
export function registerCatalogTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Product Catalogs
  // ===========================================================================
  server.tool(
    'metaads_list_catalogs',
    `List product catalogs for a business.

Returns a paginated list of product catalogs.

Args:
  - businessId: The business ID (required)
  - limit: Number of catalogs to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of catalogs with id, name, vertical, product_count, etc.`,
    {
      businessId: z.string().describe('Business ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of catalogs to return'),
      after: z.string().optional().describe('Pagination cursor'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ businessId, limit, after, fields, format }) => {
      try {
        const result = await client.listProductCatalogs(businessId, { limit, after, fields });
        return formatResponse(result, format, 'catalogs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Product Catalog
  // ===========================================================================
  server.tool(
    'metaads_get_catalog',
    `Get details for a specific product catalog.

Args:
  - catalogId: The catalog ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Catalog details including name, vertical, product_count, feed_count, etc.`,
    {
      catalogId: z.string().describe('Catalog ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ catalogId, fields, format }) => {
      try {
        const catalog = await client.getProductCatalog(catalogId, fields);
        return formatResponse(catalog, format, 'catalog');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Product Sets
  // ===========================================================================
  server.tool(
    'metaads_list_product_sets',
    `List product sets for a catalog.

Product sets are subsets of products used for dynamic ads targeting.

Args:
  - catalogId: The catalog ID (required)
  - limit: Number of product sets to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - format: Response format ('json' or 'markdown')

Returns:
  List of product sets with id, name, product_count, filter, etc.`,
    {
      catalogId: z.string().describe('Catalog ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of product sets to return'),
      after: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ catalogId, limit, after, format }) => {
      try {
        const result = await client.listProductSets(catalogId, { limit, after });
        return formatResponse(result, format, 'product_sets');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
