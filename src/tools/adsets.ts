/**
 * Ad Set Tools
 *
 * MCP tools for Meta Ads ad set management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type {
  AdSetStatus,
  BidStrategy,
  BillingEvent,
  OptimizationGoal,
  Targeting,
} from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const AdSetStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']);

const BillingEventEnum = z.enum([
  'APP_INSTALLS',
  'IMPRESSIONS',
  'LINK_CLICKS',
  'OFFER_CLAIMS',
  'PAGE_LIKES',
  'POST_ENGAGEMENT',
  'THRUPLAY',
  'PURCHASE',
  'LISTING_INTERACTION',
]);

const OptimizationGoalEnum = z.enum([
  'NONE',
  'APP_INSTALLS',
  'AD_RECALL_LIFT',
  'ENGAGED_USERS',
  'EVENT_RESPONSES',
  'IMPRESSIONS',
  'LEAD_GENERATION',
  'QUALITY_LEAD',
  'LINK_CLICKS',
  'OFFSITE_CONVERSIONS',
  'PAGE_LIKES',
  'POST_ENGAGEMENT',
  'QUALITY_CALL',
  'REACH',
  'LANDING_PAGE_VIEWS',
  'VISIT_INSTAGRAM_PROFILE',
  'VALUE',
  'THRUPLAY',
  'DERIVED_EVENTS',
  'APP_INSTALLS_AND_OFFSITE_CONVERSIONS',
  'CONVERSATIONS',
  'IN_APP_VALUE',
  'MESSAGING_PURCHASE_CONVERSION',
  'MESSAGING_APPOINTMENT_CONVERSION',
]);

const BidStrategyEnum = z.enum([
  'LOWEST_COST_WITHOUT_CAP',
  'LOWEST_COST_WITH_BID_CAP',
  'COST_CAP',
  'LOWEST_COST_WITH_MIN_ROAS',
]);

/**
 * Register all ad set-related tools
 */
export function registerAdSetTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Ad Sets
  // ===========================================================================
  server.tool(
    'metaads_list_adsets',
    `List ad sets for an ad account.

Returns a paginated list of ad sets with their targeting, budget, and optimization settings.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of ad sets to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - campaignId: Filter by campaign ID
  - effectiveStatus: Filter by effective status (array of statuses)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of ad sets with id, name, status, targeting, budget, optimization, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of ad sets to return'),
      after: z.string().optional().describe('Pagination cursor'),
      campaignId: z.string().optional().describe('Filter by campaign ID'),
      effectiveStatus: z.array(z.string()).optional().describe('Filter by effective status'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, campaignId, effectiveStatus, fields, format }) => {
      try {
        const result = await client.listAdSets(accountId, {
          limit,
          after,
          campaignId,
          effectiveStatus,
          fields,
        });
        return formatResponse(result, format, 'adsets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad Set
  // ===========================================================================
  server.tool(
    'metaads_get_adset',
    `Get details for a specific ad set.

Args:
  - adSetId: The ad set ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Ad set details including id, name, targeting, budget, optimization, schedule, etc.`,
    {
      adSetId: z.string().describe('Ad set ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ adSetId, fields, format }) => {
      try {
        const adSet = await client.getAdSet(adSetId, fields);
        return formatResponse(adSet, format, 'adset');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Ad Set
  // ===========================================================================
  server.tool(
    'metaads_create_adset',
    `Create a new ad set.

Creates an ad set with targeting, budget, and optimization settings.
Ad sets are created in PAUSED status by default.

Args:
  - accountId: The ad account ID (required)
  - campaignId: The campaign ID this ad set belongs to (required)
  - name: Ad set name (required)
  - billingEvent: What you're charged for (required) - IMPRESSIONS, LINK_CLICKS, etc.
  - optimizationGoal: What to optimize for (required) - CONVERSIONS, LINK_CLICKS, etc.
  - targeting: Targeting specification (required) - JSON object with:
    - geo_locations: { countries: ['US'], cities: [...] }
    - age_min: Minimum age (13-65)
    - age_max: Maximum age (13-65)
    - genders: [1] for male, [2] for female, [1,2] for all
    - interests: [{ id: '123', name: 'Interest' }]
    - custom_audiences: [{ id: 'audience_id' }]
    - publisher_platforms: ['facebook', 'instagram']
  - status: Initial status (default: PAUSED)
  - dailyBudget: Daily budget in cents
  - lifetimeBudget: Lifetime budget in cents
  - bidAmount: Bid amount in cents
  - bidStrategy: Bid strategy
  - startTime: Start time (ISO 8601)
  - endTime: End time (ISO 8601)

Returns:
  The created ad set with all fields.`,
    {
      accountId: z.string().describe('Ad account ID'),
      campaignId: z.string().describe('Campaign ID'),
      name: z.string().describe('Ad set name'),
      billingEvent: BillingEventEnum.describe('Billing event'),
      optimizationGoal: OptimizationGoalEnum.describe('Optimization goal'),
      targeting: z.record(z.string(), z.unknown()).describe('Targeting specification as JSON object'),
      status: AdSetStatusEnum.optional().describe('Initial status (default: PAUSED)'),
      dailyBudget: z.number().int().optional().describe('Daily budget in cents'),
      lifetimeBudget: z.number().int().optional().describe('Lifetime budget in cents'),
      bidAmount: z.number().int().optional().describe('Bid amount in cents'),
      bidStrategy: BidStrategyEnum.optional().describe('Bid strategy'),
      startTime: z.string().optional().describe('Start time (ISO 8601)'),
      endTime: z.string().optional().describe('End time (ISO 8601)'),
    },
    async ({
      accountId,
      campaignId,
      name,
      billingEvent,
      optimizationGoal,
      targeting,
      status,
      dailyBudget,
      lifetimeBudget,
      bidAmount,
      bidStrategy,
      startTime,
      endTime,
    }) => {
      try {
        const adSet = await client.createAdSet(accountId, {
          campaign_id: campaignId,
          name,
          billing_event: billingEvent as BillingEvent,
          optimization_goal: optimizationGoal as OptimizationGoal,
          targeting: targeting as Targeting,
          status: status as AdSetStatus | undefined,
          daily_budget: dailyBudget,
          lifetime_budget: lifetimeBudget,
          bid_amount: bidAmount,
          bid_strategy: bidStrategy as BidStrategy | undefined,
          start_time: startTime,
          end_time: endTime,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Ad set created', adSet }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Ad Set
  // ===========================================================================
  server.tool(
    'metaads_update_adset',
    `Update an existing ad set.

Update ad set settings such as name, status, targeting, budget, or optimization.

Args:
  - adSetId: Ad set ID to update (required)
  - name: New ad set name
  - status: New status (ACTIVE, PAUSED, DELETED, ARCHIVED)
  - targeting: New targeting specification
  - dailyBudget: New daily budget in cents
  - lifetimeBudget: New lifetime budget in cents
  - bidAmount: New bid amount in cents
  - bidStrategy: New bid strategy
  - optimizationGoal: New optimization goal
  - billingEvent: New billing event
  - startTime: New start time (ISO 8601)
  - endTime: New end time (ISO 8601)

Returns:
  The updated ad set with all fields.`,
    {
      adSetId: z.string().describe('Ad set ID to update'),
      name: z.string().optional().describe('New ad set name'),
      status: AdSetStatusEnum.optional().describe('New status'),
      targeting: z.record(z.string(), z.unknown()).optional().describe('New targeting specification'),
      dailyBudget: z.number().int().optional().describe('New daily budget in cents'),
      lifetimeBudget: z.number().int().optional().describe('New lifetime budget in cents'),
      bidAmount: z.number().int().optional().describe('New bid amount in cents'),
      bidStrategy: BidStrategyEnum.optional().describe('New bid strategy'),
      optimizationGoal: OptimizationGoalEnum.optional().describe('New optimization goal'),
      billingEvent: BillingEventEnum.optional().describe('New billing event'),
      startTime: z.string().optional().describe('New start time (ISO 8601)'),
      endTime: z.string().optional().describe('New end time (ISO 8601)'),
    },
    async ({
      adSetId,
      name,
      status,
      targeting,
      dailyBudget,
      lifetimeBudget,
      bidAmount,
      bidStrategy,
      optimizationGoal,
      billingEvent,
      startTime,
      endTime,
    }) => {
      try {
        const adSet = await client.updateAdSet(adSetId, {
          name,
          status: status as AdSetStatus | undefined,
          targeting: targeting as Targeting | undefined,
          daily_budget: dailyBudget,
          lifetime_budget: lifetimeBudget,
          bid_amount: bidAmount,
          bid_strategy: bidStrategy as BidStrategy | undefined,
          optimization_goal: optimizationGoal as OptimizationGoal | undefined,
          billing_event: billingEvent as BillingEvent | undefined,
          start_time: startTime,
          end_time: endTime,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Ad set updated', adSet }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Ad Set
  // ===========================================================================
  server.tool(
    'metaads_delete_adset',
    `Delete an ad set.

This permanently deletes the ad set. Use update with status='ARCHIVED' for soft delete.

Args:
  - adSetId: Ad set ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      adSetId: z.string().describe('Ad set ID to delete'),
    },
    async ({ adSetId }) => {
      try {
        await client.deleteAdSet(adSetId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Ad set ${adSetId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
