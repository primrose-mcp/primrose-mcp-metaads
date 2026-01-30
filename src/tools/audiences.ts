/**
 * Audience Tools
 *
 * MCP tools for Meta Ads custom audiences and lookalike audiences.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type { CustomAudienceSubtype } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const CustomAudienceSubtypeEnum = z.enum([
  'CUSTOM',
  'WEBSITE',
  'APP',
  'OFFLINE_CONVERSION',
  'CLAIM',
  'PARTNER',
  'MANAGED',
  'VIDEO',
  'LOOKALIKE',
  'ENGAGEMENT',
  'BAG_OF_ACCOUNTS',
  'STUDY_RULE_AUDIENCE',
  'FOX',
]);

/**
 * Register all audience-related tools
 */
export function registerAudienceTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Custom Audiences
  // ===========================================================================
  server.tool(
    'metaads_list_audiences',
    `List custom audiences for an ad account.

Returns a paginated list of custom audiences including website, app, and customer list audiences.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of audiences to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of audiences with id, name, subtype, approximate size, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of audiences to return'),
      after: z.string().optional().describe('Pagination cursor'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, fields, format }) => {
      try {
        const result = await client.listCustomAudiences(accountId, { limit, after, fields });
        return formatResponse(result, format, 'audiences');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Custom Audience
  // ===========================================================================
  server.tool(
    'metaads_get_audience',
    `Get details for a specific custom audience.

Args:
  - audienceId: The audience ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Audience details including name, subtype, size, data source, delivery status, etc.`,
    {
      audienceId: z.string().describe('Audience ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ audienceId, fields, format }) => {
      try {
        const audience = await client.getCustomAudience(audienceId, fields);
        return formatResponse(audience, format, 'audience');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Custom Audience
  // ===========================================================================
  server.tool(
    'metaads_create_audience',
    `Create a new custom audience.

Creates a custom audience that can be used for ad targeting.

Subtypes:
- CUSTOM: Customer list audience (upload emails, phone numbers, etc.)
- WEBSITE: Website visitors (requires pixel)
- APP: App users
- ENGAGEMENT: People who engaged with your content
- LOOKALIKE: Similar to source audience

Args:
  - accountId: The ad account ID (required)
  - name: Audience name (required)
  - subtype: Audience subtype (required)
  - description: Audience description
  - customerFileSource: For CUSTOM subtype: 'USER_PROVIDED_ONLY', 'PARTNER_PROVIDED_ONLY', 'BOTH_USER_AND_PARTNER_PROVIDED'
  - pixelId: For WEBSITE subtype: pixel ID
  - rule: For WEBSITE subtype: JSON rule for matching visitors
  - prefill: For WEBSITE subtype: prefill with historical data (true/false)
  - retentionDays: How long to keep users in audience (1-180 days)
  - lookalikeSpec: For LOOKALIKE subtype: { origin_audience_id, ratio, country }

Returns:
  The created audience with all fields.`,
    {
      accountId: z.string().describe('Ad account ID'),
      name: z.string().describe('Audience name'),
      subtype: CustomAudienceSubtypeEnum.describe('Audience subtype'),
      description: z.string().optional().describe('Audience description'),
      customerFileSource: z.enum([
        'USER_PROVIDED_ONLY',
        'PARTNER_PROVIDED_ONLY',
        'BOTH_USER_AND_PARTNER_PROVIDED',
      ]).optional().describe('Customer file source'),
      pixelId: z.string().optional().describe('Pixel ID for website audiences'),
      rule: z.string().optional().describe('JSON rule for website audiences'),
      prefill: z.boolean().optional().describe('Prefill with historical data'),
      retentionDays: z.number().int().min(1).max(180).optional().describe('Retention days'),
      lookalikeSpec: z.object({
        origin_audience_id: z.string(),
        ratio: z.number().min(0.01).max(0.20),
        country: z.string(),
      }).optional().describe('Lookalike specification'),
    },
    async ({
      accountId,
      name,
      subtype,
      description,
      customerFileSource,
      pixelId,
      rule,
      prefill,
      retentionDays,
      lookalikeSpec,
    }) => {
      try {
        const audience = await client.createCustomAudience(accountId, {
          name,
          subtype: subtype as CustomAudienceSubtype,
          description,
          customer_file_source: customerFileSource,
          pixel_id: pixelId,
          rule,
          prefill,
          retention_days: retentionDays,
          lookalike_spec: lookalikeSpec,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Audience created', audience }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Custom Audience
  // ===========================================================================
  server.tool(
    'metaads_update_audience',
    `Update an existing custom audience.

Args:
  - audienceId: Audience ID to update (required)
  - name: New audience name
  - description: New description
  - optOutLink: Privacy opt-out link

Returns:
  The updated audience with all fields.`,
    {
      audienceId: z.string().describe('Audience ID to update'),
      name: z.string().optional().describe('New audience name'),
      description: z.string().optional().describe('New description'),
      optOutLink: z.string().optional().describe('Privacy opt-out link'),
    },
    async ({ audienceId, name, description, optOutLink }) => {
      try {
        const audience = await client.updateCustomAudience(audienceId, {
          name,
          description,
          opt_out_link: optOutLink,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Audience updated', audience }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Custom Audience
  // ===========================================================================
  server.tool(
    'metaads_delete_audience',
    `Delete a custom audience.

This permanently deletes the audience.

Args:
  - audienceId: Audience ID to delete (required)

Returns:
  Confirmation of deletion.`,
    {
      audienceId: z.string().describe('Audience ID to delete'),
    },
    async ({ audienceId }) => {
      try {
        await client.deleteCustomAudience(audienceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Audience ${audienceId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Users to Audience
  // ===========================================================================
  server.tool(
    'metaads_add_users_to_audience',
    `Add users to a custom audience.

Adds users to a CUSTOM subtype audience using hashed identifiers.

Schema types:
- EMAIL, EMAIL_SHA256: Email addresses
- PHONE, PHONE_SHA256: Phone numbers
- FN: First name
- LN: Last name
- EXTERN_ID: External ID
- MADID: Mobile Advertiser ID

Args:
  - audienceId: Audience ID (required)
  - schema: Array of identifier types in order (required)
  - data: Array of user data arrays matching schema (required)

Example:
  schema: ['EMAIL_SHA256', 'PHONE_SHA256']
  data: [['hashed_email1', 'hashed_phone1'], ['hashed_email2', 'hashed_phone2']]

Returns:
  Result with audience_id, num_received, num_invalid_entries.`,
    {
      audienceId: z.string().describe('Audience ID'),
      schema: z.array(z.string()).describe('Array of identifier types'),
      data: z.array(z.array(z.string())).describe('Array of user data arrays'),
    },
    async ({ audienceId, schema, data }) => {
      try {
        const result = await client.addUsersToAudience(audienceId, schema, data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Users added to audience', result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Users from Audience
  // ===========================================================================
  server.tool(
    'metaads_remove_users_from_audience',
    `Remove users from a custom audience.

Removes users from a CUSTOM subtype audience.

Args:
  - audienceId: Audience ID (required)
  - schema: Array of identifier types in order (required)
  - data: Array of user data arrays matching schema (required)

Returns:
  Result with audience_id, num_received, num_invalid_entries.`,
    {
      audienceId: z.string().describe('Audience ID'),
      schema: z.array(z.string()).describe('Array of identifier types'),
      data: z.array(z.array(z.string())).describe('Array of user data arrays'),
    },
    async ({ audienceId, schema, data }) => {
      try {
        const result = await client.removeUsersFromAudience(audienceId, schema, data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Users removed from audience', result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
