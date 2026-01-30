/**
 * Campaign Tools
 *
 * MCP tools for Meta Ads campaign management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type { CampaignObjective, CampaignStatus, BidStrategy, SpecialAdCategory } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const CampaignObjectiveEnum = z.enum([
  'OUTCOME_AWARENESS',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_LEADS',
  'OUTCOME_SALES',
  'OUTCOME_TRAFFIC',
  'OUTCOME_APP_PROMOTION',
  'BRAND_AWARENESS',
  'REACH',
  'LINK_CLICKS',
  'POST_ENGAGEMENT',
  'VIDEO_VIEWS',
  'LEAD_GENERATION',
  'MESSAGES',
  'CONVERSIONS',
  'PRODUCT_CATALOG_SALES',
  'APP_INSTALLS',
  'STORE_VISITS',
]);

const CampaignStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']);

const BidStrategyEnum = z.enum([
  'LOWEST_COST_WITHOUT_CAP',
  'LOWEST_COST_WITH_BID_CAP',
  'COST_CAP',
  'LOWEST_COST_WITH_MIN_ROAS',
]);

const SpecialAdCategoryEnum = z.enum([
  'NONE',
  'EMPLOYMENT',
  'HOUSING',
  'CREDIT',
  'ISSUES_ELECTIONS_POLITICS',
  'ONLINE_GAMBLING_AND_GAMING',
]);

/**
 * Register all campaign-related tools
 */
export function registerCampaignTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Campaigns
  // ===========================================================================
  server.tool(
    'metaads_list_campaigns',
    `List campaigns for an ad account.

Returns a paginated list of campaigns with their status, objective, and budget.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of campaigns to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - effectiveStatus: Filter by effective status (array of statuses)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of campaigns with id, name, objective, status, budget, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of campaigns to return'),
      after: z.string().optional().describe('Pagination cursor'),
      effectiveStatus: z.array(z.string()).optional().describe('Filter by effective status'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, effectiveStatus, fields, format }) => {
      try {
        const result = await client.listCampaigns(accountId, {
          limit,
          after,
          effectiveStatus,
          fields,
        });
        return formatResponse(result, format, 'campaigns');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Campaign
  // ===========================================================================
  server.tool(
    'metaads_get_campaign',
    `Get details for a specific campaign.

Args:
  - campaignId: The campaign ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Campaign details including id, name, objective, status, budget, schedule, etc.`,
    {
      campaignId: z.string().describe('Campaign ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ campaignId, fields, format }) => {
      try {
        const campaign = await client.getCampaign(campaignId, fields);
        return formatResponse(campaign, format, 'campaign');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Campaign
  // ===========================================================================
  server.tool(
    'metaads_create_campaign',
    `Create a new campaign.

Creates a new advertising campaign with the specified objective and settings.
Campaigns are created in PAUSED status by default for review before activation.

Args:
  - accountId: The ad account ID (required)
  - name: Campaign name (required)
  - objective: Campaign objective (required) - one of:
    - OUTCOME_AWARENESS, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_SALES,
    - OUTCOME_TRAFFIC, OUTCOME_APP_PROMOTION
  - status: Initial status (default: PAUSED)
  - specialAdCategories: Array of special ad categories (default: ['NONE'])
  - dailyBudget: Daily budget in cents (e.g., 1000 = $10.00)
  - lifetimeBudget: Lifetime budget in cents
  - bidStrategy: Bid strategy for the campaign
  - spendCap: Spend cap in cents
  - buyingType: 'AUCTION' or 'RESERVED' (default: AUCTION)
  - startTime: Campaign start time (ISO 8601 format)
  - stopTime: Campaign stop time (ISO 8601 format)

Returns:
  The created campaign with all fields.`,
    {
      accountId: z.string().describe('Ad account ID'),
      name: z.string().describe('Campaign name'),
      objective: CampaignObjectiveEnum.describe('Campaign objective'),
      status: CampaignStatusEnum.optional().describe('Initial status (default: PAUSED)'),
      specialAdCategories: z.array(SpecialAdCategoryEnum).optional().describe('Special ad categories'),
      dailyBudget: z.number().int().optional().describe('Daily budget in cents'),
      lifetimeBudget: z.number().int().optional().describe('Lifetime budget in cents'),
      bidStrategy: BidStrategyEnum.optional().describe('Bid strategy'),
      spendCap: z.number().int().optional().describe('Spend cap in cents'),
      buyingType: z.enum(['AUCTION', 'RESERVED']).optional().describe('Buying type'),
      startTime: z.string().optional().describe('Start time (ISO 8601)'),
      stopTime: z.string().optional().describe('Stop time (ISO 8601)'),
    },
    async ({
      accountId,
      name,
      objective,
      status,
      specialAdCategories,
      dailyBudget,
      lifetimeBudget,
      bidStrategy,
      spendCap,
      buyingType,
      startTime,
      stopTime,
    }) => {
      try {
        const campaign = await client.createCampaign(accountId, {
          name,
          objective: objective as CampaignObjective,
          status: status as CampaignStatus | undefined,
          special_ad_categories: specialAdCategories as SpecialAdCategory[] | undefined,
          daily_budget: dailyBudget,
          lifetime_budget: lifetimeBudget,
          bid_strategy: bidStrategy as BidStrategy | undefined,
          spend_cap: spendCap,
          buying_type: buyingType,
          start_time: startTime,
          stop_time: stopTime,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Campaign created', campaign }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Campaign
  // ===========================================================================
  server.tool(
    'metaads_update_campaign',
    `Update an existing campaign.

Update campaign settings such as name, status, budget, or schedule.

Args:
  - campaignId: Campaign ID to update (required)
  - name: New campaign name
  - status: New status (ACTIVE, PAUSED, DELETED, ARCHIVED)
  - dailyBudget: New daily budget in cents
  - lifetimeBudget: New lifetime budget in cents
  - bidStrategy: New bid strategy
  - spendCap: New spend cap in cents
  - startTime: New start time (ISO 8601)
  - stopTime: New stop time (ISO 8601)

Returns:
  The updated campaign with all fields.`,
    {
      campaignId: z.string().describe('Campaign ID to update'),
      name: z.string().optional().describe('New campaign name'),
      status: CampaignStatusEnum.optional().describe('New status'),
      dailyBudget: z.number().int().optional().describe('New daily budget in cents'),
      lifetimeBudget: z.number().int().optional().describe('New lifetime budget in cents'),
      bidStrategy: BidStrategyEnum.optional().describe('New bid strategy'),
      spendCap: z.number().int().optional().describe('New spend cap in cents'),
      startTime: z.string().optional().describe('New start time (ISO 8601)'),
      stopTime: z.string().optional().describe('New stop time (ISO 8601)'),
    },
    async ({
      campaignId,
      name,
      status,
      dailyBudget,
      lifetimeBudget,
      bidStrategy,
      spendCap,
      startTime,
      stopTime,
    }) => {
      try {
        const campaign = await client.updateCampaign(campaignId, {
          name,
          status: status as CampaignStatus | undefined,
          daily_budget: dailyBudget,
          lifetime_budget: lifetimeBudget,
          bid_strategy: bidStrategy as BidStrategy | undefined,
          spend_cap: spendCap,
          start_time: startTime,
          stop_time: stopTime,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Campaign updated', campaign }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Campaign
  // ===========================================================================
  server.tool(
    'metaads_delete_campaign',
    `Delete a campaign.

This permanently deletes the campaign. Use update with status='ARCHIVED' for soft delete.

Args:
  - campaignId: Campaign ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      campaignId: z.string().describe('Campaign ID to delete'),
    },
    async ({ campaignId }) => {
      try {
        await client.deleteCampaign(campaignId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Campaign ${campaignId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
