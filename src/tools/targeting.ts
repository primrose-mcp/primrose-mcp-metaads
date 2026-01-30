/**
 * Targeting Tools
 *
 * MCP tools for Meta Ads targeting search and delivery estimates.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type { Targeting } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const TargetingTypeEnum = z.enum([
  'adinterest',
  'adinterestsuggestion',
  'adinterestvalid',
  'adTargetingCategory',
  'adgeolocation',
  'adlocale',
  'adeducationschool',
  'adworkemployer',
  'adworkposition',
  'adzipcode',
  'adgeolocationmeta',
  'adradiussuggestion',
]);

/**
 * Register all targeting-related tools
 */
export function registerTargetingTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // Search Targeting
  // ===========================================================================
  server.tool(
    'metaads_search_targeting',
    `Search for targeting options like interests, behaviors, demographics.

Search for available targeting options that can be used in ad sets.

Types:
- adinterest: Search for interests
- adinterestsuggestion: Get interest suggestions
- adTargetingCategory: Browse targeting categories
- adgeolocation: Search for locations
- adlocale: Search for languages
- adeducationschool: Search for schools
- adworkemployer: Search for employers
- adworkposition: Search for job titles

Args:
  - accountId: The ad account ID (required)
  - type: Type of targeting to search (required)
  - query: Search query (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of targeting options with id, name, type, and audience size estimates.`,
    {
      accountId: z.string().describe('Ad account ID'),
      type: TargetingTypeEnum.describe('Type of targeting to search'),
      query: z.string().describe('Search query'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, type, query, format }) => {
      try {
        const results = await client.searchTargeting(accountId, type, query);
        return formatResponse({ data: results }, format, 'targeting');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Targeting Categories
  // ===========================================================================
  server.tool(
    'metaads_get_targeting_categories',
    `Browse available targeting categories.

Get a list of available targeting categories for a given type.

Args:
  - accountId: The ad account ID (required)
  - type: Type of targeting categories (required)
  - format: Response format ('json' or 'markdown')

Returns:
  List of targeting categories with id, name, and type.`,
    {
      accountId: z.string().describe('Ad account ID'),
      type: TargetingTypeEnum.describe('Type of targeting categories'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, type, format }) => {
      try {
        const results = await client.getTargetingCategories(accountId, type);
        return formatResponse({ data: results }, format, 'targeting_categories');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Delivery Estimate
  // ===========================================================================
  server.tool(
    'metaads_get_delivery_estimate',
    `Get estimated delivery for a targeting specification.

Estimate the potential reach for a given targeting configuration.

Args:
  - accountId: The ad account ID (required)
  - targeting: Targeting specification (required) - JSON object with:
    - geo_locations: { countries: ['US'] }
    - age_min: Minimum age
    - age_max: Maximum age
    - genders: [1] male, [2] female
    - interests: [{ id: '123', name: 'Interest' }]
    - etc.
  - optimizationGoal: Optimization goal (required) - e.g., 'LINK_CLICKS', 'IMPRESSIONS', 'CONVERSIONS'
  - format: Response format ('json' or 'markdown')

Returns:
  Delivery estimate with estimated daily reach, impressions, and audience size.`,
    {
      accountId: z.string().describe('Ad account ID'),
      targeting: z.record(z.string(), z.unknown()).describe('Targeting specification'),
      optimizationGoal: z.string().describe('Optimization goal'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, targeting, optimizationGoal, format }) => {
      try {
        const estimate = await client.getDeliveryEstimate(
          accountId,
          targeting as Targeting,
          optimizationGoal
        );
        return formatResponse(estimate, format, 'delivery_estimate');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Reach & Frequency Prediction
  // ===========================================================================
  server.tool(
    'metaads_get_reach_frequency',
    `Get a reach and frequency prediction.

Retrieve an existing reach and frequency prediction.

Args:
  - accountId: The ad account ID (required)
  - predictionId: The prediction ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Reach and frequency prediction with curves and estimates.`,
    {
      accountId: z.string().describe('Ad account ID'),
      predictionId: z.string().describe('Prediction ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, predictionId, format }) => {
      try {
        const prediction = await client.getReachFrequencyPrediction(accountId, predictionId);
        return formatResponse(prediction, format, 'reach_frequency_prediction');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Reach & Frequency Prediction
  // ===========================================================================
  server.tool(
    'metaads_create_reach_frequency',
    `Create a reach and frequency prediction.

Create a new reach and frequency prediction for planning purposes.

Args:
  - accountId: The ad account ID (required)
  - targetSpec: Targeting specification (required)
  - startTime: Campaign start time (required, Unix timestamp)
  - stopTime: Campaign stop time (required, Unix timestamp)
  - objective: Campaign objective (required)
  - reachFrequency: Budget or reach goal (required) - one of:
    - { budget: amount_in_cents }
    - { reach: number_of_people }
  - frequencyCap: Maximum frequency cap
  - format: Response format ('json' or 'markdown')

Returns:
  Created prediction with reach and frequency curves.`,
    {
      accountId: z.string().describe('Ad account ID'),
      targetSpec: z.record(z.string(), z.unknown()).describe('Targeting specification'),
      startTime: z.number().describe('Start time (Unix timestamp)'),
      stopTime: z.number().describe('Stop time (Unix timestamp)'),
      objective: z.string().describe('Campaign objective'),
      budget: z.number().int().optional().describe('Budget in cents'),
      reach: z.number().int().optional().describe('Target reach'),
      frequencyCap: z.number().int().optional().describe('Frequency cap'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({
      accountId,
      targetSpec,
      startTime,
      stopTime,
      objective,
      budget,
      reach,
      frequencyCap,
      format,
    }) => {
      try {
        const params: Record<string, unknown> = {
          target_spec: JSON.stringify(targetSpec),
          start_time: startTime,
          stop_time: stopTime,
          objective,
        };

        if (budget) params.budget = budget;
        if (reach) params.reach = reach;
        if (frequencyCap) params.frequency_cap = frequencyCap;

        const prediction = await client.createReachFrequencyPrediction(accountId, params);
        return formatResponse(prediction, format, 'reach_frequency_prediction');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
