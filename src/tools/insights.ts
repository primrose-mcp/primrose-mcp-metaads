/**
 * Insights Tools
 *
 * MCP tools for Meta Ads insights and reporting.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type {
  DatePreset,
  InsightsField,
  InsightsBreakdown,
  ActionBreakdown,
  AttributionWindow,
  InsightsParams,
} from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const DatePresetEnum = z.enum([
  'today',
  'yesterday',
  'this_month',
  'last_month',
  'this_quarter',
  'maximum',
  'data_maximum',
  'last_3d',
  'last_7d',
  'last_14d',
  'last_28d',
  'last_30d',
  'last_90d',
  'last_week_mon_sun',
  'last_week_sun_sat',
  'last_quarter',
  'last_year',
  'this_week_mon_today',
  'this_week_sun_today',
  'this_year',
]);

const InsightsFieldEnum = z.enum([
  'account_currency',
  'account_id',
  'account_name',
  'action_values',
  'actions',
  'ad_id',
  'ad_name',
  'adset_id',
  'adset_name',
  'campaign_id',
  'campaign_name',
  'clicks',
  'conversions',
  'conversion_values',
  'cost_per_action_type',
  'cost_per_conversion',
  'cost_per_inline_link_click',
  'cost_per_inline_post_engagement',
  'cost_per_unique_click',
  'cost_per_unique_inline_link_click',
  'cpc',
  'cpm',
  'cpp',
  'ctr',
  'date_start',
  'date_stop',
  'frequency',
  'impressions',
  'inline_link_click_ctr',
  'inline_link_clicks',
  'inline_post_engagement',
  'objective',
  'optimization_goal',
  'purchase_roas',
  'reach',
  'social_spend',
  'spend',
  'unique_clicks',
  'unique_ctr',
  'unique_inline_link_click_ctr',
  'unique_inline_link_clicks',
  'unique_link_clicks_ctr',
  'video_avg_time_watched_actions',
  'video_p100_watched_actions',
  'video_p25_watched_actions',
  'video_p50_watched_actions',
  'video_p75_watched_actions',
  'video_p95_watched_actions',
  'video_play_actions',
  'video_thruplay_watched_actions',
  'website_ctr',
  'website_purchase_roas',
]);

const BreakdownEnum = z.enum([
  'ad_format_asset',
  'age',
  'body_asset',
  'call_to_action_asset',
  'country',
  'description_asset',
  'device_platform',
  'dma',
  'frequency_value',
  'gender',
  'hourly_stats_aggregated_by_advertiser_time_zone',
  'hourly_stats_aggregated_by_audience_time_zone',
  'image_asset',
  'impression_device',
  'link_url_asset',
  'place_page_id',
  'platform_position',
  'product_id',
  'publisher_platform',
  'region',
  'skan_conversion_id',
  'title_asset',
  'video_asset',
]);

const ActionBreakdownEnum = z.enum([
  'action_canvas_component_name',
  'action_carousel_card_id',
  'action_carousel_card_name',
  'action_destination',
  'action_device',
  'action_reaction',
  'action_target_id',
  'action_type',
  'action_video_sound',
  'action_video_type',
]);

const AttributionWindowEnum = z.enum([
  '1d_click',
  '7d_click',
  '28d_click',
  '1d_view',
]);

/**
 * Register all insights-related tools
 */
export function registerInsightsTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // Get Account Insights
  // ===========================================================================
  server.tool(
    'metaads_get_account_insights',
    `Get insights (performance metrics) for an ad account.

Returns performance data like impressions, clicks, spend, conversions, etc.

Args:
  - accountId: The ad account ID (required)
  - datePreset: Date range preset (e.g., 'last_7d', 'last_30d', 'this_month')
  - timeRange: Custom time range { since: 'YYYY-MM-DD', until: 'YYYY-MM-DD' }
  - timeIncrement: Break down by time period ('1', '7', '28', 'monthly', 'all_days')
  - fields: Array of metrics to return
  - breakdowns: Array of dimensions to break down by (age, gender, country, etc.)
  - actionBreakdowns: Array of action breakdowns
  - attributionWindows: Attribution windows (1d_click, 7d_click, etc.)
  - level: Aggregation level ('account', 'campaign', 'adset', 'ad')
  - limit: Maximum number of results
  - format: Response format ('json' or 'markdown')

Returns:
  Array of insights with requested metrics and breakdowns.`,
    {
      accountId: z.string().describe('Ad account ID'),
      datePreset: DatePresetEnum.optional().describe('Date range preset'),
      timeRange: z.object({
        since: z.string(),
        until: z.string(),
      }).optional().describe('Custom time range'),
      timeIncrement: z.string().optional().describe('Time increment for breakdown'),
      fields: z.array(InsightsFieldEnum).optional().describe('Metrics to return'),
      breakdowns: z.array(BreakdownEnum).optional().describe('Dimensions to break down by'),
      actionBreakdowns: z.array(ActionBreakdownEnum).optional().describe('Action breakdowns'),
      attributionWindows: z.array(AttributionWindowEnum).optional().describe('Attribution windows'),
      level: z.enum(['account', 'campaign', 'adset', 'ad']).optional().describe('Aggregation level'),
      limit: z.number().int().min(1).max(1000).optional().describe('Maximum results'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({
      accountId,
      datePreset,
      timeRange,
      timeIncrement,
      fields,
      breakdowns,
      actionBreakdowns,
      attributionWindows,
      level,
      limit,
      format,
    }) => {
      try {
        const params: InsightsParams = {};
        if (datePreset) params.date_preset = datePreset as DatePreset;
        if (timeRange) params.time_range = timeRange;
        if (timeIncrement) params.time_increment = timeIncrement;
        if (fields) params.fields = fields as InsightsField[];
        if (breakdowns) params.breakdowns = breakdowns as InsightsBreakdown[];
        if (actionBreakdowns) params.action_breakdowns = actionBreakdowns as ActionBreakdown[];
        if (attributionWindows) params.action_attribution_windows = attributionWindows as AttributionWindow[];
        if (level) params.level = level;
        if (limit) params.limit = limit;

        const insights = await client.getAccountInsights(accountId, params);
        return formatResponse({ data: insights }, format, 'insights');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Campaign Insights
  // ===========================================================================
  server.tool(
    'metaads_get_campaign_insights',
    `Get insights (performance metrics) for a specific campaign.

Args:
  - campaignId: The campaign ID (required)
  - datePreset: Date range preset
  - timeRange: Custom time range { since: 'YYYY-MM-DD', until: 'YYYY-MM-DD' }
  - timeIncrement: Time increment for breakdown
  - fields: Array of metrics to return
  - breakdowns: Array of dimensions to break down by
  - format: Response format

Returns:
  Array of insights for the campaign.`,
    {
      campaignId: z.string().describe('Campaign ID'),
      datePreset: DatePresetEnum.optional().describe('Date range preset'),
      timeRange: z.object({
        since: z.string(),
        until: z.string(),
      }).optional().describe('Custom time range'),
      timeIncrement: z.string().optional().describe('Time increment'),
      fields: z.array(InsightsFieldEnum).optional().describe('Metrics to return'),
      breakdowns: z.array(BreakdownEnum).optional().describe('Breakdowns'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ campaignId, datePreset, timeRange, timeIncrement, fields, breakdowns, format }) => {
      try {
        const params: InsightsParams = {};
        if (datePreset) params.date_preset = datePreset as DatePreset;
        if (timeRange) params.time_range = timeRange;
        if (timeIncrement) params.time_increment = timeIncrement;
        if (fields) params.fields = fields as InsightsField[];
        if (breakdowns) params.breakdowns = breakdowns as InsightsBreakdown[];

        const insights = await client.getCampaignInsights(campaignId, params);
        return formatResponse({ data: insights }, format, 'insights');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad Set Insights
  // ===========================================================================
  server.tool(
    'metaads_get_adset_insights',
    `Get insights (performance metrics) for a specific ad set.

Args:
  - adSetId: The ad set ID (required)
  - datePreset: Date range preset
  - timeRange: Custom time range
  - timeIncrement: Time increment
  - fields: Array of metrics to return
  - breakdowns: Array of dimensions to break down by
  - format: Response format

Returns:
  Array of insights for the ad set.`,
    {
      adSetId: z.string().describe('Ad set ID'),
      datePreset: DatePresetEnum.optional().describe('Date range preset'),
      timeRange: z.object({
        since: z.string(),
        until: z.string(),
      }).optional().describe('Custom time range'),
      timeIncrement: z.string().optional().describe('Time increment'),
      fields: z.array(InsightsFieldEnum).optional().describe('Metrics to return'),
      breakdowns: z.array(BreakdownEnum).optional().describe('Breakdowns'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ adSetId, datePreset, timeRange, timeIncrement, fields, breakdowns, format }) => {
      try {
        const params: InsightsParams = {};
        if (datePreset) params.date_preset = datePreset as DatePreset;
        if (timeRange) params.time_range = timeRange;
        if (timeIncrement) params.time_increment = timeIncrement;
        if (fields) params.fields = fields as InsightsField[];
        if (breakdowns) params.breakdowns = breakdowns as InsightsBreakdown[];

        const insights = await client.getAdSetInsights(adSetId, params);
        return formatResponse({ data: insights }, format, 'insights');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad Insights
  // ===========================================================================
  server.tool(
    'metaads_get_ad_insights',
    `Get insights (performance metrics) for a specific ad.

Args:
  - adId: The ad ID (required)
  - datePreset: Date range preset
  - timeRange: Custom time range
  - timeIncrement: Time increment
  - fields: Array of metrics to return
  - breakdowns: Array of dimensions to break down by
  - format: Response format

Returns:
  Array of insights for the ad.`,
    {
      adId: z.string().describe('Ad ID'),
      datePreset: DatePresetEnum.optional().describe('Date range preset'),
      timeRange: z.object({
        since: z.string(),
        until: z.string(),
      }).optional().describe('Custom time range'),
      timeIncrement: z.string().optional().describe('Time increment'),
      fields: z.array(InsightsFieldEnum).optional().describe('Metrics to return'),
      breakdowns: z.array(BreakdownEnum).optional().describe('Breakdowns'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ adId, datePreset, timeRange, timeIncrement, fields, breakdowns, format }) => {
      try {
        const params: InsightsParams = {};
        if (datePreset) params.date_preset = datePreset as DatePreset;
        if (timeRange) params.time_range = timeRange;
        if (timeIncrement) params.time_increment = timeIncrement;
        if (fields) params.fields = fields as InsightsField[];
        if (breakdowns) params.breakdowns = breakdowns as InsightsBreakdown[];

        const insights = await client.getAdInsights(adId, params);
        return formatResponse({ data: insights }, format, 'insights');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
