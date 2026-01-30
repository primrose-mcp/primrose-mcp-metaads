/**
 * Response Formatting Utilities for Meta Ads API
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Ad,
  AdAccount,
  AdCreative,
  AdSet,
  Campaign,
  CustomAudience,
  Insights,
  PaginatedResponse,
  Pixel,
  ProductCatalog,
  ResponseFormat,
} from '../types/entities.js';
import { MetaAdsApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof MetaAdsApiError) {
    message = `Error: ${error.message}`;
    if (error.errorUserMsg) {
      message += ` - ${error.errorUserMsg}`;
    }
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).data)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  lines.push(`**Showing:** ${data.data.length}`);

  if (data.paging?.cursors?.after) {
    lines.push(`**More available:** Yes (cursor: \`${data.paging.cursors.after}\`)`);
  }
  lines.push('');

  if (data.data.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'ad_accounts':
      lines.push(formatAdAccountsTable(data.data as AdAccount[]));
      break;
    case 'campaigns':
      lines.push(formatCampaignsTable(data.data as Campaign[]));
      break;
    case 'adsets':
      lines.push(formatAdSetsTable(data.data as AdSet[]));
      break;
    case 'ads':
      lines.push(formatAdsTable(data.data as Ad[]));
      break;
    case 'creatives':
      lines.push(formatCreativesTable(data.data as AdCreative[]));
      break;
    case 'audiences':
      lines.push(formatAudiencesTable(data.data as CustomAudience[]));
      break;
    case 'pixels':
      lines.push(formatPixelsTable(data.data as Pixel[]));
      break;
    case 'catalogs':
      lines.push(formatCatalogsTable(data.data as ProductCatalog[]));
      break;
    case 'insights':
      lines.push(formatInsightsTable(data.data as Insights[]));
      break;
    default:
      lines.push(formatGenericTable(data.data));
  }

  return lines.join('\n');
}

/**
 * Format ad accounts as Markdown table
 */
function formatAdAccountsTable(accounts: AdAccount[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Currency | Timezone |');
  lines.push('|---|---|---|---|---|');

  for (const account of accounts) {
    const statusMap: Record<number, string> = {
      1: 'Active',
      2: 'Disabled',
      3: 'Unsettled',
      7: 'Pending Review',
      8: 'Pending Settlement',
      9: 'In Grace Period',
      100: 'Pending Closure',
      101: 'Closed',
    };
    const status = statusMap[account.account_status] || String(account.account_status);
    lines.push(
      `| ${account.id} | ${account.name || '-'} | ${status} | ${account.currency || '-'} | ${account.timezone_name || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format campaigns as Markdown table
 */
function formatCampaignsTable(campaigns: Campaign[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Objective | Budget |');
  lines.push('|---|---|---|---|---|');

  for (const campaign of campaigns) {
    const budget = campaign.daily_budget
      ? `$${(Number(campaign.daily_budget) / 100).toFixed(2)}/day`
      : campaign.lifetime_budget
        ? `$${(Number(campaign.lifetime_budget) / 100).toFixed(2)} lifetime`
        : '-';
    lines.push(
      `| ${campaign.id} | ${campaign.name} | ${campaign.effective_status} | ${campaign.objective} | ${budget} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format ad sets as Markdown table
 */
function formatAdSetsTable(adsets: AdSet[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Optimization | Budget |');
  lines.push('|---|---|---|---|---|');

  for (const adset of adsets) {
    const budget = adset.daily_budget
      ? `$${(Number(adset.daily_budget) / 100).toFixed(2)}/day`
      : adset.lifetime_budget
        ? `$${(Number(adset.lifetime_budget) / 100).toFixed(2)} lifetime`
        : '-';
    lines.push(
      `| ${adset.id} | ${adset.name} | ${adset.effective_status} | ${adset.optimization_goal} | ${budget} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format ads as Markdown table
 */
function formatAdsTable(ads: Ad[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Ad Set ID |');
  lines.push('|---|---|---|---|');

  for (const ad of ads) {
    lines.push(
      `| ${ad.id} | ${ad.name} | ${ad.effective_status} | ${ad.adset_id} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format ad creatives as Markdown table
 */
function formatCreativesTable(creatives: AdCreative[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Status |');
  lines.push('|---|---|---|---|');

  for (const creative of creatives) {
    lines.push(
      `| ${creative.id} | ${creative.name || '-'} | ${creative.object_type || '-'} | ${creative.status || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format custom audiences as Markdown table
 */
function formatAudiencesTable(audiences: CustomAudience[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Subtype | Approx Size |');
  lines.push('|---|---|---|---|');

  for (const audience of audiences) {
    const size =
      audience.approximate_count_lower_bound && audience.approximate_count_upper_bound
        ? `${audience.approximate_count_lower_bound.toLocaleString()}-${audience.approximate_count_upper_bound.toLocaleString()}`
        : '-';
    lines.push(
      `| ${audience.id} | ${audience.name} | ${audience.subtype} | ${size} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format pixels as Markdown table
 */
function formatPixelsTable(pixels: Pixel[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Last Fired |');
  lines.push('|---|---|---|');

  for (const pixel of pixels) {
    lines.push(
      `| ${pixel.id} | ${pixel.name} | ${pixel.last_fired_time || 'Never'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format product catalogs as Markdown table
 */
function formatCatalogsTable(catalogs: ProductCatalog[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Vertical | Product Count |');
  lines.push('|---|---|---|---|');

  for (const catalog of catalogs) {
    lines.push(
      `| ${catalog.id} | ${catalog.name} | ${catalog.vertical || '-'} | ${catalog.product_count || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format insights as Markdown table
 */
function formatInsightsTable(insights: Insights[]): string {
  const lines: string[] = [];
  lines.push('| Date | Impressions | Reach | Clicks | Spend | CTR | CPC |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const insight of insights) {
    const dateRange =
      insight.date_start === insight.date_stop
        ? insight.date_start || '-'
        : `${insight.date_start || ''} - ${insight.date_stop || ''}`;
    lines.push(
      `| ${dateRange} | ${insight.impressions || '-'} | ${insight.reach || '-'} | ${insight.clicks || '-'} | $${insight.spend || '0'} | ${insight.ctr || '-'}% | $${insight.cpc || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (snake_case to Title Case)
 */
function formatKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
