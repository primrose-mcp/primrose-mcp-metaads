/**
 * Pixel Tools
 *
 * MCP tools for Meta Ads pixel management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all pixel-related tools
 */
export function registerPixelTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Pixels
  // ===========================================================================
  server.tool(
    'metaads_list_pixels',
    `List Meta Pixels for an ad account.

Returns a paginated list of pixels with their configuration and status.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of pixels to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of pixels with id, name, code, last_fired_time, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of pixels to return'),
      after: z.string().optional().describe('Pagination cursor'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, fields, format }) => {
      try {
        const result = await client.listPixels(accountId, { limit, after, fields });
        return formatResponse(result, format, 'pixels');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Pixel
  // ===========================================================================
  server.tool(
    'metaads_get_pixel',
    `Get details for a specific Meta Pixel.

Args:
  - pixelId: The pixel ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Pixel details including name, code, settings, last_fired_time, owner, etc.`,
    {
      pixelId: z.string().describe('Pixel ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pixelId, fields, format }) => {
      try {
        const pixel = await client.getPixel(pixelId, fields);
        return formatResponse(pixel, format, 'pixel');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Pixel
  // ===========================================================================
  server.tool(
    'metaads_create_pixel',
    `Create a new Meta Pixel.

Creates a new pixel for tracking website conversions.

Args:
  - accountId: The ad account ID (required)
  - name: Pixel name (required)

Returns:
  The created pixel with id, name, and installation code.`,
    {
      accountId: z.string().describe('Ad account ID'),
      name: z.string().describe('Pixel name'),
    },
    async ({ accountId, name }) => {
      try {
        const pixel = await client.createPixel(accountId, { name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Pixel created', pixel }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
