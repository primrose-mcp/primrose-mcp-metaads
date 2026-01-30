/**
 * Ad Tools
 *
 * MCP tools for Meta Ads ad management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type { AdStatus, AdCreativeInput } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const AdStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']);

/**
 * Register all ad-related tools
 */
export function registerAdTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Ads
  // ===========================================================================
  server.tool(
    'metaads_list_ads',
    `List ads for an ad account.

Returns a paginated list of ads with their status, creative, and ad set.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of ads to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - adSetId: Filter by ad set ID
  - effectiveStatus: Filter by effective status (array of statuses)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of ads with id, name, status, creative, ad set, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of ads to return'),
      after: z.string().optional().describe('Pagination cursor'),
      adSetId: z.string().optional().describe('Filter by ad set ID'),
      effectiveStatus: z.array(z.string()).optional().describe('Filter by effective status'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, adSetId, effectiveStatus, fields, format }) => {
      try {
        const result = await client.listAds(accountId, {
          limit,
          after,
          adSetId,
          effectiveStatus,
          fields,
        });
        return formatResponse(result, format, 'ads');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad
  // ===========================================================================
  server.tool(
    'metaads_get_ad',
    `Get details for a specific ad.

Args:
  - adId: The ad ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Ad details including id, name, status, creative, tracking specs, etc.`,
    {
      adId: z.string().describe('Ad ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ adId, fields, format }) => {
      try {
        const ad = await client.getAd(adId, fields);
        return formatResponse(ad, format, 'ad');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Ad
  // ===========================================================================
  server.tool(
    'metaads_create_ad',
    `Create a new ad.

Creates an ad with a creative linked to an ad set.
Ads are created in PAUSED status by default.

Args:
  - accountId: The ad account ID (required)
  - adSetId: The ad set ID this ad belongs to (required)
  - name: Ad name (required)
  - creative: Creative specification (required) - JSON object with either:
    - For new creative: { name: 'Creative Name', object_story_spec: { page_id: '...', link_data: { ... } } }
    - For existing creative: { creative_id: 'existing_creative_id' }
  - status: Initial status (default: PAUSED)

Returns:
  The created ad with all fields.`,
    {
      accountId: z.string().describe('Ad account ID'),
      adSetId: z.string().describe('Ad set ID'),
      name: z.string().describe('Ad name'),
      creative: z.record(z.string(), z.unknown()).describe('Creative specification as JSON object'),
      status: AdStatusEnum.optional().describe('Initial status (default: PAUSED)'),
    },
    async ({ accountId, adSetId, name, creative, status }) => {
      try {
        const ad = await client.createAd(accountId, {
          adset_id: adSetId,
          name,
          creative: creative as AdCreativeInput,
          status: status as AdStatus | undefined,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Ad created', ad }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Ad
  // ===========================================================================
  server.tool(
    'metaads_update_ad',
    `Update an existing ad.

Update ad settings such as name, status, or creative.

Args:
  - adId: Ad ID to update (required)
  - name: New ad name
  - status: New status (ACTIVE, PAUSED, DELETED, ARCHIVED)
  - creative: New creative specification

Returns:
  The updated ad with all fields.`,
    {
      adId: z.string().describe('Ad ID to update'),
      name: z.string().optional().describe('New ad name'),
      status: AdStatusEnum.optional().describe('New status'),
      creative: z.record(z.string(), z.unknown()).optional().describe('New creative specification'),
    },
    async ({ adId, name, status, creative }) => {
      try {
        const ad = await client.updateAd(adId, {
          name,
          status: status as AdStatus | undefined,
          creative: creative as AdCreativeInput | undefined,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Ad updated', ad }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Ad
  // ===========================================================================
  server.tool(
    'metaads_delete_ad',
    `Delete an ad.

This permanently deletes the ad. Use update with status='ARCHIVED' for soft delete.

Args:
  - adId: Ad ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      adId: z.string().describe('Ad ID to delete'),
    },
    async ({ adId }) => {
      try {
        await client.deleteAd(adId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Ad ${adId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
