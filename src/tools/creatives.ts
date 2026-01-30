/**
 * Creative Tools
 *
 * MCP tools for Meta Ads creative management including images and videos.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetaAdsClient } from '../client.js';
import type { AdCreativeInput } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all creative-related tools
 */
export function registerCreativeTools(server: McpServer, client: MetaAdsClient): void {
  // ===========================================================================
  // List Ad Creatives
  // ===========================================================================
  server.tool(
    'metaads_list_creatives',
    `List ad creatives for an ad account.

Returns a paginated list of creatives with their specifications.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of creatives to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  List of creatives with id, name, object_story_spec, status, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of creatives to return'),
      after: z.string().optional().describe('Pagination cursor'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, fields, format }) => {
      try {
        const result = await client.listAdCreatives(accountId, { limit, after, fields });
        return formatResponse(result, format, 'creatives');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad Creative
  // ===========================================================================
  server.tool(
    'metaads_get_creative',
    `Get details for a specific ad creative.

Args:
  - creativeId: The creative ID (required)
  - fields: Comma-separated list of fields to return
  - format: Response format ('json' or 'markdown')

Returns:
  Creative details including object_story_spec, asset_feed_spec, etc.`,
    {
      creativeId: z.string().describe('Creative ID'),
      fields: z.string().optional().describe('Comma-separated list of fields'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ creativeId, fields, format }) => {
      try {
        const creative = await client.getAdCreative(creativeId, fields);
        return formatResponse(creative, format, 'creative');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Ad Creative
  // ===========================================================================
  server.tool(
    'metaads_create_creative',
    `Create a new ad creative.

Creates a standalone creative that can be used by multiple ads.

Args:
  - accountId: The ad account ID (required)
  - name: Creative name
  - objectStorySpec: Object story specification (for link/video/photo ads)
    Example for link ad:
    {
      "page_id": "your_page_id",
      "link_data": {
        "link": "https://example.com",
        "message": "Check out our offer!",
        "name": "Product Name",
        "description": "Product description",
        "image_hash": "abc123...",
        "call_to_action": { "type": "LEARN_MORE", "value": { "link": "https://example.com" } }
      }
    }
  - assetFeedSpec: Asset feed specification (for dynamic creative)
  - urlTags: URL parameters to append to links
  - usePageActorOverride: Use page as actor

Returns:
  The created creative with all fields.`,
    {
      accountId: z.string().describe('Ad account ID'),
      name: z.string().optional().describe('Creative name'),
      objectStorySpec: z.record(z.string(), z.unknown()).optional().describe('Object story specification'),
      assetFeedSpec: z.record(z.string(), z.unknown()).optional().describe('Asset feed specification'),
      urlTags: z.string().optional().describe('URL parameters to append'),
      usePageActorOverride: z.boolean().optional().describe('Use page as actor'),
    },
    async ({ accountId, name, objectStorySpec, assetFeedSpec, urlTags, usePageActorOverride }) => {
      try {
        const input: AdCreativeInput = {};
        if (name) input.name = name;
        if (objectStorySpec) input.object_story_spec = objectStorySpec as unknown as AdCreativeInput['object_story_spec'];
        if (assetFeedSpec) input.asset_feed_spec = assetFeedSpec as unknown as AdCreativeInput['asset_feed_spec'];
        if (urlTags) input.url_tags = urlTags;
        if (usePageActorOverride !== undefined) input.use_page_actor_override = usePageActorOverride;

        const creative = await client.createAdCreative(accountId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Creative created', creative }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Ad Images
  // ===========================================================================
  server.tool(
    'metaads_list_images',
    `List ad images for an ad account.

Returns a paginated list of uploaded images with their hashes and URLs.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of images to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - hashes: Filter by specific image hashes (array)
  - format: Response format ('json' or 'markdown')

Returns:
  List of images with hash, url, dimensions, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of images to return'),
      after: z.string().optional().describe('Pagination cursor'),
      hashes: z.array(z.string()).optional().describe('Filter by image hashes'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, hashes, format }) => {
      try {
        const result = await client.listAdImages(accountId, { limit, after, hashes });
        return formatResponse(result, format, 'images');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Upload Ad Image
  // ===========================================================================
  server.tool(
    'metaads_upload_image',
    `Upload an ad image.

Uploads an image to the ad account's image library.
The returned hash can be used when creating ad creatives.

Args:
  - accountId: The ad account ID (required)
  - imageData: Base64 encoded image data (required)
  - name: Image name

Returns:
  The uploaded image with hash, url, dimensions, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      imageData: z.string().describe('Base64 encoded image data'),
      name: z.string().optional().describe('Image name'),
    },
    async ({ accountId, imageData, name }) => {
      try {
        const image = await client.uploadAdImage(accountId, imageData, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Image uploaded', image }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Ad Videos
  // ===========================================================================
  server.tool(
    'metaads_list_videos',
    `List ad videos for an ad account.

Returns a paginated list of uploaded videos.

Args:
  - accountId: The ad account ID (required)
  - limit: Number of videos to return (1-100, default: 25)
  - after: Pagination cursor for next page
  - format: Response format ('json' or 'markdown')

Returns:
  List of videos with id, title, description, thumbnail, status, etc.`,
    {
      accountId: z.string().describe('Ad account ID'),
      limit: z.number().int().min(1).max(100).default(25).describe('Number of videos to return'),
      after: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ accountId, limit, after, format }) => {
      try {
        const result = await client.listAdVideos(accountId, { limit, after });
        return formatResponse(result, format, 'videos');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Ad Video
  // ===========================================================================
  server.tool(
    'metaads_get_video',
    `Get details for a specific ad video.

Args:
  - videoId: The video ID (required)
  - format: Response format ('json' or 'markdown')

Returns:
  Video details including title, description, thumbnail, status, length, etc.`,
    {
      videoId: z.string().describe('Video ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ videoId, format }) => {
      try {
        const video = await client.getAdVideo(videoId);
        return formatResponse(video, format, 'video');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
