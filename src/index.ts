/**
 * Meta Ads MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It provides tools for managing Meta (Facebook) advertising campaigns,
 * ad sets, ads, audiences, pixels, and more.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (access tokens, etc.) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Meta-Access-Token: Meta/Facebook OAuth access token
 *
 * Optional Headers:
 * - X-Meta-Ad-Account-Id: Default ad account ID (act_XXXX format)
 * - X-Meta-Business-Id: Business Manager ID
 * - X-Meta-App-Id: App ID (for app-scoped tokens)
 * - X-Meta-App-Secret: App secret (for server-to-server auth)
 * - X-Meta-Api-Version: API version override (default: v21.0)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createMetaAdsClient } from './client.js';
import {
  registerAccountTools,
  registerAdSetTools,
  registerAdTools,
  registerAudienceTools,
  registerBusinessTools,
  registerCampaignTools,
  registerCatalogTools,
  registerCreativeTools,
  registerInsightsTools,
  registerPixelTools,
  registerTargetingTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-metaads';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class MetaAdsMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Meta-Access-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createMetaAdsClient(credentials);

  // Register all tools
  registerAccountTools(server, client);
  registerCampaignTools(server, client);
  registerAdSetTools(server, client);
  registerAdTools(server, client);
  registerCreativeTools(server, client);
  registerInsightsTools(server, client);
  registerAudienceTools(server, client);
  registerPixelTools(server, client);
  registerCatalogTools(server, client);
  registerTargetingTools(server, client);
  registerBusinessTools(server, client);

  // Test connection tool
  server.tool(
    'metaads_test_connection',
    'Test the connection to the Meta Marketing API. Verifies that the access token is valid and returns the authenticated user info.',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME, version: SERVER_VERSION }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Meta-Access-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Meta Ads MCP Server for managing Facebook/Instagram advertising',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Meta-Access-Token': 'Meta/Facebook OAuth access token',
          },
          optional_headers: {
            'X-Meta-Ad-Account-Id': 'Default ad account ID (act_XXXX format)',
            'X-Meta-Business-Id': 'Business Manager ID',
            'X-Meta-App-Id': 'App ID (for app-scoped tokens)',
            'X-Meta-App-Secret': 'App secret (for server-to-server auth)',
            'X-Meta-Api-Version': 'API version override (default: v21.0)',
          },
        },
        tools: [
          // Account Management
          'metaads_test_connection',
          'metaads_list_ad_accounts',
          'metaads_get_ad_account',
          // Campaigns
          'metaads_list_campaigns',
          'metaads_get_campaign',
          'metaads_create_campaign',
          'metaads_update_campaign',
          'metaads_delete_campaign',
          // Ad Sets
          'metaads_list_adsets',
          'metaads_get_adset',
          'metaads_create_adset',
          'metaads_update_adset',
          'metaads_delete_adset',
          // Ads
          'metaads_list_ads',
          'metaads_get_ad',
          'metaads_create_ad',
          'metaads_update_ad',
          'metaads_delete_ad',
          // Creatives
          'metaads_list_creatives',
          'metaads_get_creative',
          'metaads_create_creative',
          'metaads_list_images',
          'metaads_upload_image',
          'metaads_list_videos',
          'metaads_get_video',
          // Insights
          'metaads_get_account_insights',
          'metaads_get_campaign_insights',
          'metaads_get_adset_insights',
          'metaads_get_ad_insights',
          // Audiences
          'metaads_list_audiences',
          'metaads_get_audience',
          'metaads_create_audience',
          'metaads_update_audience',
          'metaads_delete_audience',
          'metaads_add_users_to_audience',
          'metaads_remove_users_from_audience',
          // Pixels
          'metaads_list_pixels',
          'metaads_get_pixel',
          'metaads_create_pixel',
          // Catalogs
          'metaads_list_catalogs',
          'metaads_get_catalog',
          'metaads_list_product_sets',
          // Targeting
          'metaads_search_targeting',
          'metaads_get_targeting_categories',
          'metaads_get_delivery_estimate',
          'metaads_get_reach_frequency',
          'metaads_create_reach_frequency',
          // Business Manager
          'metaads_list_businesses',
          'metaads_get_business',
          'metaads_list_business_ad_accounts',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
