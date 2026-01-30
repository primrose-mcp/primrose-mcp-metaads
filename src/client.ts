/**
 * Meta Ads API Client
 *
 * Handles all HTTP communication with the Meta Marketing API.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different access tokens.
 */

import type {
  Ad,
  AdAccount,
  AdCreateInput,
  AdCreative,
  AdCreativeInput,
  AdImage,
  AdSet,
  AdSetCreateInput,
  AdSetUpdateInput,
  AdUpdateInput,
  AdVideo,
  Business,
  Campaign,
  CampaignCreateInput,
  CampaignUpdateInput,
  CustomAudience,
  CustomAudienceCreateInput,
  CustomAudienceUpdateInput,
  DeliveryEstimate,
  Insights,
  InsightsParams,
  PaginatedResponse,
  PaginationParams,
  Pixel,
  PixelCreateInput,
  ProductCatalog,
  ProductSet,
  ReachFrequencyPrediction,
  Targeting,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import {
  AuthenticationError,
  RateLimitError,
  parseMetaApiError,
} from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const META_API_BASE_URL = 'https://graph.facebook.com';
const DEFAULT_API_VERSION = 'v21.0';

// Default fields for common entities
const DEFAULT_AD_ACCOUNT_FIELDS = [
  'id',
  'account_id',
  'name',
  'account_status',
  'amount_spent',
  'balance',
  'business',
  'currency',
  'timezone_name',
  'created_time',
].join(',');

const DEFAULT_CAMPAIGN_FIELDS = [
  'id',
  'account_id',
  'name',
  'objective',
  'status',
  'effective_status',
  'buying_type',
  'daily_budget',
  'lifetime_budget',
  'budget_remaining',
  'bid_strategy',
  'special_ad_categories',
  'start_time',
  'stop_time',
  'created_time',
  'updated_time',
].join(',');

const DEFAULT_ADSET_FIELDS = [
  'id',
  'account_id',
  'campaign_id',
  'name',
  'status',
  'effective_status',
  'billing_event',
  'optimization_goal',
  'bid_amount',
  'bid_strategy',
  'daily_budget',
  'lifetime_budget',
  'budget_remaining',
  'start_time',
  'end_time',
  'targeting',
  'promoted_object',
  'created_time',
  'updated_time',
].join(',');

const DEFAULT_AD_FIELDS = [
  'id',
  'account_id',
  'adset_id',
  'campaign_id',
  'name',
  'status',
  'effective_status',
  'creative',
  'created_time',
  'updated_time',
].join(',');

const DEFAULT_CREATIVE_FIELDS = [
  'id',
  'account_id',
  'name',
  'title',
  'body',
  'call_to_action_type',
  'image_hash',
  'image_url',
  'video_id',
  'thumbnail_url',
  'object_story_spec',
  'object_type',
  'status',
  'created_time',
].join(',');

const DEFAULT_AUDIENCE_FIELDS = [
  'id',
  'account_id',
  'name',
  'description',
  'subtype',
  'approximate_count_lower_bound',
  'approximate_count_upper_bound',
  'data_source',
  'delivery_status',
  'operation_status',
  'retention_days',
  'time_created',
  'time_updated',
].join(',');

const DEFAULT_PIXEL_FIELDS = [
  'id',
  'name',
  'code',
  'creation_time',
  'creator',
  'data_use_setting',
  'enable_automatic_matching',
  'last_fired_time',
  'owner_business',
  'owner_ad_account',
].join(',');

const DEFAULT_CATALOG_FIELDS = [
  'id',
  'name',
  'business',
  'feed_count',
  'product_count',
  'vertical',
].join(',');

const DEFAULT_INSIGHTS_FIELDS = [
  'impressions',
  'reach',
  'clicks',
  'spend',
  'cpc',
  'cpm',
  'ctr',
  'frequency',
  'actions',
  'conversions',
  'cost_per_action_type',
  'date_start',
  'date_stop',
].join(',');

// =============================================================================
// Meta Ads Client Interface
// =============================================================================

export interface MetaAdsClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string; user?: { id: string; name: string } }>;

  // Ad Accounts
  listAdAccounts(params?: PaginationParams & { fields?: string }): Promise<PaginatedResponse<AdAccount>>;
  getAdAccount(accountId: string, fields?: string): Promise<AdAccount>;

  // Campaigns
  listCampaigns(accountId: string, params?: PaginationParams & { fields?: string; effectiveStatus?: string[] }): Promise<PaginatedResponse<Campaign>>;
  getCampaign(campaignId: string, fields?: string): Promise<Campaign>;
  createCampaign(accountId: string, input: CampaignCreateInput): Promise<Campaign>;
  updateCampaign(campaignId: string, input: CampaignUpdateInput): Promise<Campaign>;
  deleteCampaign(campaignId: string): Promise<void>;

  // Ad Sets
  listAdSets(accountId: string, params?: PaginationParams & { fields?: string; campaignId?: string; effectiveStatus?: string[] }): Promise<PaginatedResponse<AdSet>>;
  getAdSet(adSetId: string, fields?: string): Promise<AdSet>;
  createAdSet(accountId: string, input: AdSetCreateInput): Promise<AdSet>;
  updateAdSet(adSetId: string, input: AdSetUpdateInput): Promise<AdSet>;
  deleteAdSet(adSetId: string): Promise<void>;

  // Ads
  listAds(accountId: string, params?: PaginationParams & { fields?: string; adSetId?: string; effectiveStatus?: string[] }): Promise<PaginatedResponse<Ad>>;
  getAd(adId: string, fields?: string): Promise<Ad>;
  createAd(accountId: string, input: AdCreateInput): Promise<Ad>;
  updateAd(adId: string, input: AdUpdateInput): Promise<Ad>;
  deleteAd(adId: string): Promise<void>;

  // Ad Creatives
  listAdCreatives(accountId: string, params?: PaginationParams & { fields?: string }): Promise<PaginatedResponse<AdCreative>>;
  getAdCreative(creativeId: string, fields?: string): Promise<AdCreative>;
  createAdCreative(accountId: string, input: AdCreativeInput): Promise<AdCreative>;

  // Ad Images
  listAdImages(accountId: string, params?: PaginationParams & { hashes?: string[] }): Promise<PaginatedResponse<AdImage>>;
  uploadAdImage(accountId: string, imageData: string, name?: string): Promise<AdImage>;

  // Ad Videos
  listAdVideos(accountId: string, params?: PaginationParams): Promise<PaginatedResponse<AdVideo>>;
  getAdVideo(videoId: string): Promise<AdVideo>;

  // Insights
  getAccountInsights(accountId: string, params?: InsightsParams): Promise<Insights[]>;
  getCampaignInsights(campaignId: string, params?: InsightsParams): Promise<Insights[]>;
  getAdSetInsights(adSetId: string, params?: InsightsParams): Promise<Insights[]>;
  getAdInsights(adId: string, params?: InsightsParams): Promise<Insights[]>;

  // Custom Audiences
  listCustomAudiences(accountId: string, params?: PaginationParams & { fields?: string }): Promise<PaginatedResponse<CustomAudience>>;
  getCustomAudience(audienceId: string, fields?: string): Promise<CustomAudience>;
  createCustomAudience(accountId: string, input: CustomAudienceCreateInput): Promise<CustomAudience>;
  updateCustomAudience(audienceId: string, input: CustomAudienceUpdateInput): Promise<CustomAudience>;
  deleteCustomAudience(audienceId: string): Promise<void>;
  addUsersToAudience(audienceId: string, schema: string[], data: string[][]): Promise<{ audience_id: string; num_received: number; num_invalid_entries: number }>;
  removeUsersFromAudience(audienceId: string, schema: string[], data: string[][]): Promise<{ audience_id: string; num_received: number; num_invalid_entries: number }>;

  // Pixels
  listPixels(accountId: string, params?: PaginationParams & { fields?: string }): Promise<PaginatedResponse<Pixel>>;
  getPixel(pixelId: string, fields?: string): Promise<Pixel>;
  createPixel(accountId: string, input: PixelCreateInput): Promise<Pixel>;

  // Product Catalogs
  listProductCatalogs(businessId: string, params?: PaginationParams & { fields?: string }): Promise<PaginatedResponse<ProductCatalog>>;
  getProductCatalog(catalogId: string, fields?: string): Promise<ProductCatalog>;
  listProductSets(catalogId: string, params?: PaginationParams): Promise<PaginatedResponse<ProductSet>>;

  // Delivery Estimates
  getDeliveryEstimate(accountId: string, targeting: Targeting, optimizationGoal: string): Promise<DeliveryEstimate>;

  // Reach & Frequency
  getReachFrequencyPrediction(accountId: string, predictionId: string): Promise<ReachFrequencyPrediction>;
  createReachFrequencyPrediction(accountId: string, params: Record<string, unknown>): Promise<ReachFrequencyPrediction>;

  // Business Manager
  getBusinesses(params?: PaginationParams): Promise<PaginatedResponse<Business>>;
  getBusiness(businessId: string): Promise<Business>;
  listBusinessAdAccounts(businessId: string, params?: PaginationParams): Promise<PaginatedResponse<AdAccount>>;

  // Targeting Search
  searchTargeting(accountId: string, type: string, query: string): Promise<Array<{ id: string; name: string; type: string; audience_size_lower_bound?: number; audience_size_upper_bound?: number }>>;
  getTargetingCategories(accountId: string, type: string): Promise<Array<{ id: string; name: string; type: string }>>;
}

// =============================================================================
// Meta Ads Client Implementation
// =============================================================================

class MetaAdsClientImpl implements MetaAdsClient {
  private credentials: TenantCredentials;
  private baseUrl: string;
  private apiVersion: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.baseUrl = META_API_BASE_URL;
    this.apiVersion = credentials.apiVersion || DEFAULT_API_VERSION;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthParams(): URLSearchParams {
    return new URLSearchParams({
      access_token: this.credentials.accessToken,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string | string[] | number | boolean | undefined>
  ): Promise<T> {
    const searchParams = this.getAuthParams();

    // Add additional params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            searchParams.set(key, JSON.stringify(value));
          } else {
            searchParams.set(key, String(value));
          }
        }
      }
    }

    const url = `${this.baseUrl}/${this.apiVersion}${endpoint}?${searchParams.toString()}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        'Rate limit exceeded',
        retryAfter ? Number.parseInt(retryAfter, 10) : 60
      );
    }

    // Handle errors
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw parseMetaApiError(errorBody as Record<string, unknown>, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private async postForm<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    formData.append('access_token', this.credentials.accessToken);

    const url = `${this.baseUrl}/${this.apiVersion}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw parseMetaApiError(errorBody as Record<string, unknown>, response.status);
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string; user?: { id: string; name: string } }> {
    try {
      const result = await this.request<{ id: string; name: string }>('/me', {}, { fields: 'id,name' });
      return {
        connected: true,
        message: 'Successfully connected to Meta Marketing API',
        user: result,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Ad Accounts
  // ===========================================================================

  async listAdAccounts(params?: PaginationParams & { fields?: string }): Promise<PaginatedResponse<AdAccount>> {
    return this.request<PaginatedResponse<AdAccount>>('/me/adaccounts', {}, {
      fields: params?.fields || DEFAULT_AD_ACCOUNT_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getAdAccount(accountId: string, fields?: string): Promise<AdAccount> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<AdAccount>(`/${id}`, {}, {
      fields: fields || DEFAULT_AD_ACCOUNT_FIELDS,
    });
  }

  // ===========================================================================
  // Campaigns
  // ===========================================================================

  async listCampaigns(
    accountId: string,
    params?: PaginationParams & { fields?: string; effectiveStatus?: string[] }
  ): Promise<PaginatedResponse<Campaign>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<PaginatedResponse<Campaign>>(`/${id}/campaigns`, {}, {
      fields: params?.fields || DEFAULT_CAMPAIGN_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
      effective_status: params?.effectiveStatus,
    });
  }

  async getCampaign(campaignId: string, fields?: string): Promise<Campaign> {
    return this.request<Campaign>(`/${campaignId}`, {}, {
      fields: fields || DEFAULT_CAMPAIGN_FIELDS,
    });
  }

  async createCampaign(accountId: string, input: CampaignCreateInput): Promise<Campaign> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const params: Record<string, unknown> = {
      name: input.name,
      objective: input.objective,
      status: input.status || 'PAUSED',
      special_ad_categories: input.special_ad_categories || ['NONE'],
    };

    if (input.daily_budget) params.daily_budget = input.daily_budget;
    if (input.lifetime_budget) params.lifetime_budget = input.lifetime_budget;
    if (input.bid_strategy) params.bid_strategy = input.bid_strategy;
    if (input.spend_cap) params.spend_cap = input.spend_cap;
    if (input.buying_type) params.buying_type = input.buying_type;
    if (input.start_time) params.start_time = input.start_time;
    if (input.stop_time) params.stop_time = input.stop_time;
    if (input.promoted_object) params.promoted_object = JSON.stringify(input.promoted_object);

    const result = await this.request<{ id: string }>(`/${id}/campaigns`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getCampaign(result.id);
  }

  async updateCampaign(campaignId: string, input: CampaignUpdateInput): Promise<Campaign> {
    const params: Record<string, unknown> = {};

    if (input.name !== undefined) params.name = input.name;
    if (input.status !== undefined) params.status = input.status;
    if (input.daily_budget !== undefined) params.daily_budget = input.daily_budget;
    if (input.lifetime_budget !== undefined) params.lifetime_budget = input.lifetime_budget;
    if (input.bid_strategy !== undefined) params.bid_strategy = input.bid_strategy;
    if (input.spend_cap !== undefined) params.spend_cap = input.spend_cap;
    if (input.start_time !== undefined) params.start_time = input.start_time;
    if (input.stop_time !== undefined) params.stop_time = input.stop_time;

    await this.request(`/${campaignId}`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getCampaign(campaignId);
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await this.request(`/${campaignId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Ad Sets
  // ===========================================================================

  async listAdSets(
    accountId: string,
    params?: PaginationParams & { fields?: string; campaignId?: string; effectiveStatus?: string[] }
  ): Promise<PaginatedResponse<AdSet>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;

    const queryParams: Record<string, string | string[] | number | boolean | undefined> = {
      fields: params?.fields || DEFAULT_ADSET_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
      effective_status: params?.effectiveStatus,
    };

    // Filter by campaign if specified
    if (params?.campaignId) {
      queryParams.filtering = JSON.stringify([{
        field: 'campaign.id',
        operator: 'EQUAL',
        value: params.campaignId,
      }]);
    }

    return this.request<PaginatedResponse<AdSet>>(`/${id}/adsets`, {}, queryParams);
  }

  async getAdSet(adSetId: string, fields?: string): Promise<AdSet> {
    return this.request<AdSet>(`/${adSetId}`, {}, {
      fields: fields || DEFAULT_ADSET_FIELDS,
    });
  }

  async createAdSet(accountId: string, input: AdSetCreateInput): Promise<AdSet> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const params: Record<string, unknown> = {
      campaign_id: input.campaign_id,
      name: input.name,
      billing_event: input.billing_event,
      optimization_goal: input.optimization_goal,
      status: input.status || 'PAUSED',
      targeting: JSON.stringify(input.targeting),
    };

    if (input.bid_amount) params.bid_amount = input.bid_amount;
    if (input.bid_strategy) params.bid_strategy = input.bid_strategy;
    if (input.daily_budget) params.daily_budget = input.daily_budget;
    if (input.lifetime_budget) params.lifetime_budget = input.lifetime_budget;
    if (input.start_time) params.start_time = input.start_time;
    if (input.end_time) params.end_time = input.end_time;
    if (input.promoted_object) params.promoted_object = JSON.stringify(input.promoted_object);
    if (input.destination_type) params.destination_type = input.destination_type;
    if (input.attribution_spec) params.attribution_spec = JSON.stringify(input.attribution_spec);
    if (input.is_dynamic_creative !== undefined) params.is_dynamic_creative = input.is_dynamic_creative;
    if (input.pacing_type) params.pacing_type = JSON.stringify(input.pacing_type);

    const result = await this.request<{ id: string }>(`/${id}/adsets`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getAdSet(result.id);
  }

  async updateAdSet(adSetId: string, input: AdSetUpdateInput): Promise<AdSet> {
    const params: Record<string, unknown> = {};

    if (input.name !== undefined) params.name = input.name;
    if (input.status !== undefined) params.status = input.status;
    if (input.targeting !== undefined) params.targeting = JSON.stringify(input.targeting);
    if (input.bid_amount !== undefined) params.bid_amount = input.bid_amount;
    if (input.bid_strategy !== undefined) params.bid_strategy = input.bid_strategy;
    if (input.daily_budget !== undefined) params.daily_budget = input.daily_budget;
    if (input.lifetime_budget !== undefined) params.lifetime_budget = input.lifetime_budget;
    if (input.start_time !== undefined) params.start_time = input.start_time;
    if (input.end_time !== undefined) params.end_time = input.end_time;
    if (input.optimization_goal !== undefined) params.optimization_goal = input.optimization_goal;
    if (input.billing_event !== undefined) params.billing_event = input.billing_event;

    await this.request(`/${adSetId}`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getAdSet(adSetId);
  }

  async deleteAdSet(adSetId: string): Promise<void> {
    await this.request(`/${adSetId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Ads
  // ===========================================================================

  async listAds(
    accountId: string,
    params?: PaginationParams & { fields?: string; adSetId?: string; effectiveStatus?: string[] }
  ): Promise<PaginatedResponse<Ad>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;

    const queryParams: Record<string, string | string[] | number | boolean | undefined> = {
      fields: params?.fields || DEFAULT_AD_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
      effective_status: params?.effectiveStatus,
    };

    if (params?.adSetId) {
      queryParams.filtering = JSON.stringify([{
        field: 'adset.id',
        operator: 'EQUAL',
        value: params.adSetId,
      }]);
    }

    return this.request<PaginatedResponse<Ad>>(`/${id}/ads`, {}, queryParams);
  }

  async getAd(adId: string, fields?: string): Promise<Ad> {
    return this.request<Ad>(`/${adId}`, {}, {
      fields: fields || DEFAULT_AD_FIELDS,
    });
  }

  async createAd(accountId: string, input: AdCreateInput): Promise<Ad> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const params: Record<string, unknown> = {
      adset_id: input.adset_id,
      name: input.name,
      creative: JSON.stringify(input.creative),
      status: input.status || 'PAUSED',
    };

    if (input.tracking_specs) params.tracking_specs = JSON.stringify(input.tracking_specs);
    if (input.conversion_specs) params.conversion_specs = JSON.stringify(input.conversion_specs);

    const result = await this.request<{ id: string }>(`/${id}/ads`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getAd(result.id);
  }

  async updateAd(adId: string, input: AdUpdateInput): Promise<Ad> {
    const params: Record<string, unknown> = {};

    if (input.name !== undefined) params.name = input.name;
    if (input.status !== undefined) params.status = input.status;
    if (input.creative !== undefined) params.creative = JSON.stringify(input.creative);
    if (input.tracking_specs !== undefined) params.tracking_specs = JSON.stringify(input.tracking_specs);

    await this.request(`/${adId}`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getAd(adId);
  }

  async deleteAd(adId: string): Promise<void> {
    await this.request(`/${adId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Ad Creatives
  // ===========================================================================

  async listAdCreatives(
    accountId: string,
    params?: PaginationParams & { fields?: string }
  ): Promise<PaginatedResponse<AdCreative>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<PaginatedResponse<AdCreative>>(`/${id}/adcreatives`, {}, {
      fields: params?.fields || DEFAULT_CREATIVE_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getAdCreative(creativeId: string, fields?: string): Promise<AdCreative> {
    return this.request<AdCreative>(`/${creativeId}`, {}, {
      fields: fields || DEFAULT_CREATIVE_FIELDS,
    });
  }

  async createAdCreative(accountId: string, input: AdCreativeInput): Promise<AdCreative> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const params: Record<string, unknown> = {};

    if (input.name) params.name = input.name;
    if (input.object_story_spec) params.object_story_spec = JSON.stringify(input.object_story_spec);
    if (input.asset_feed_spec) params.asset_feed_spec = JSON.stringify(input.asset_feed_spec);
    if (input.degrees_of_freedom_spec) params.degrees_of_freedom_spec = JSON.stringify(input.degrees_of_freedom_spec);
    if (input.url_tags) params.url_tags = input.url_tags;
    if (input.use_page_actor_override !== undefined) params.use_page_actor_override = input.use_page_actor_override;
    if (input.authorization_category) params.authorization_category = input.authorization_category;

    const result = await this.request<{ id: string }>(`/${id}/adcreatives`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getAdCreative(result.id);
  }

  // ===========================================================================
  // Ad Images
  // ===========================================================================

  async listAdImages(
    accountId: string,
    params?: PaginationParams & { hashes?: string[] }
  ): Promise<PaginatedResponse<AdImage>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<PaginatedResponse<AdImage>>(`/${id}/adimages`, {}, {
      fields: 'id,account_id,hash,name,url,permalink_url,original_height,original_width,status,created_time',
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
      hashes: params?.hashes,
    });
  }

  async uploadAdImage(accountId: string, imageData: string, name?: string): Promise<AdImage> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const formData = new FormData();
    formData.append('bytes', imageData);
    if (name) formData.append('name', name);

    const result = await this.postForm<{ images: Record<string, AdImage> }>(`/${id}/adimages`, formData);
    const images = Object.values(result.images);
    return images[0];
  }

  // ===========================================================================
  // Ad Videos
  // ===========================================================================

  async listAdVideos(
    accountId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<AdVideo>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<PaginatedResponse<AdVideo>>(`/${id}/advideos`, {}, {
      fields: 'id,title,description,picture,permalink_url,length,status,created_time,updated_time',
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getAdVideo(videoId: string): Promise<AdVideo> {
    return this.request<AdVideo>(`/${videoId}`, {}, {
      fields: 'id,title,description,picture,permalink_url,length,status,created_time,updated_time',
    });
  }

  // ===========================================================================
  // Insights
  // ===========================================================================

  private buildInsightsParams(params?: InsightsParams): Record<string, string | number | boolean | undefined> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      fields: params?.fields?.join(',') || DEFAULT_INSIGHTS_FIELDS,
    };

    if (params?.date_preset) queryParams.date_preset = params.date_preset;
    if (params?.time_range) queryParams.time_range = JSON.stringify(params.time_range);
    if (params?.time_increment) queryParams.time_increment = String(params.time_increment);
    if (params?.level) queryParams.level = params.level;
    if (params?.breakdowns) queryParams.breakdowns = params.breakdowns.join(',');
    if (params?.action_breakdowns) queryParams.action_breakdowns = params.action_breakdowns.join(',');
    if (params?.action_attribution_windows) queryParams.action_attribution_windows = JSON.stringify(params.action_attribution_windows);
    if (params?.filtering) queryParams.filtering = JSON.stringify(params.filtering);
    if (params?.sort) queryParams.sort = params.sort.join(',');
    if (params?.limit) queryParams.limit = params.limit;

    return queryParams;
  }

  async getAccountInsights(accountId: string, params?: InsightsParams): Promise<Insights[]> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const result = await this.request<PaginatedResponse<Insights>>(
      `/${id}/insights`,
      {},
      this.buildInsightsParams(params)
    );
    return result.data;
  }

  async getCampaignInsights(campaignId: string, params?: InsightsParams): Promise<Insights[]> {
    const result = await this.request<PaginatedResponse<Insights>>(
      `/${campaignId}/insights`,
      {},
      this.buildInsightsParams(params)
    );
    return result.data;
  }

  async getAdSetInsights(adSetId: string, params?: InsightsParams): Promise<Insights[]> {
    const result = await this.request<PaginatedResponse<Insights>>(
      `/${adSetId}/insights`,
      {},
      this.buildInsightsParams(params)
    );
    return result.data;
  }

  async getAdInsights(adId: string, params?: InsightsParams): Promise<Insights[]> {
    const result = await this.request<PaginatedResponse<Insights>>(
      `/${adId}/insights`,
      {},
      this.buildInsightsParams(params)
    );
    return result.data;
  }

  // ===========================================================================
  // Custom Audiences
  // ===========================================================================

  async listCustomAudiences(
    accountId: string,
    params?: PaginationParams & { fields?: string }
  ): Promise<PaginatedResponse<CustomAudience>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<PaginatedResponse<CustomAudience>>(`/${id}/customaudiences`, {}, {
      fields: params?.fields || DEFAULT_AUDIENCE_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getCustomAudience(audienceId: string, fields?: string): Promise<CustomAudience> {
    return this.request<CustomAudience>(`/${audienceId}`, {}, {
      fields: fields || DEFAULT_AUDIENCE_FIELDS,
    });
  }

  async createCustomAudience(accountId: string, input: CustomAudienceCreateInput): Promise<CustomAudience> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const params: Record<string, unknown> = {
      name: input.name,
      subtype: input.subtype,
    };

    if (input.description) params.description = input.description;
    if (input.customer_file_source) params.customer_file_source = input.customer_file_source;
    if (input.pixel_id) params.pixel_id = input.pixel_id;
    if (input.rule) params.rule = input.rule;
    if (input.prefill !== undefined) params.prefill = input.prefill;
    if (input.retention_days) params.retention_days = input.retention_days;
    if (input.lookalike_spec) params.lookalike_spec = JSON.stringify(input.lookalike_spec);

    const result = await this.request<{ id: string }>(`/${id}/customaudiences`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getCustomAudience(result.id);
  }

  async updateCustomAudience(audienceId: string, input: CustomAudienceUpdateInput): Promise<CustomAudience> {
    const params: Record<string, unknown> = {};

    if (input.name !== undefined) params.name = input.name;
    if (input.description !== undefined) params.description = input.description;
    if (input.opt_out_link !== undefined) params.opt_out_link = input.opt_out_link;

    await this.request(`/${audienceId}`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getCustomAudience(audienceId);
  }

  async deleteCustomAudience(audienceId: string): Promise<void> {
    await this.request(`/${audienceId}`, { method: 'DELETE' });
  }

  async addUsersToAudience(
    audienceId: string,
    schema: string[],
    data: string[][]
  ): Promise<{ audience_id: string; num_received: number; num_invalid_entries: number }> {
    return this.request(`/${audienceId}/users`, {
      method: 'POST',
    }, {
      payload: JSON.stringify({
        schema,
        data,
      }),
    });
  }

  async removeUsersFromAudience(
    audienceId: string,
    schema: string[],
    data: string[][]
  ): Promise<{ audience_id: string; num_received: number; num_invalid_entries: number }> {
    return this.request(`/${audienceId}/users`, {
      method: 'DELETE',
    }, {
      payload: JSON.stringify({
        schema,
        data,
      }),
    });
  }

  // ===========================================================================
  // Pixels
  // ===========================================================================

  async listPixels(
    accountId: string,
    params?: PaginationParams & { fields?: string }
  ): Promise<PaginatedResponse<Pixel>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    return this.request<PaginatedResponse<Pixel>>(`/${id}/adspixels`, {}, {
      fields: params?.fields || DEFAULT_PIXEL_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getPixel(pixelId: string, fields?: string): Promise<Pixel> {
    return this.request<Pixel>(`/${pixelId}`, {}, {
      fields: fields || DEFAULT_PIXEL_FIELDS,
    });
  }

  async createPixel(accountId: string, input: PixelCreateInput): Promise<Pixel> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const result = await this.request<{ id: string }>(`/${id}/adspixels`, {
      method: 'POST',
    }, {
      name: input.name,
    });

    return this.getPixel(result.id);
  }

  // ===========================================================================
  // Product Catalogs
  // ===========================================================================

  async listProductCatalogs(
    businessId: string,
    params?: PaginationParams & { fields?: string }
  ): Promise<PaginatedResponse<ProductCatalog>> {
    return this.request<PaginatedResponse<ProductCatalog>>(`/${businessId}/owned_product_catalogs`, {}, {
      fields: params?.fields || DEFAULT_CATALOG_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getProductCatalog(catalogId: string, fields?: string): Promise<ProductCatalog> {
    return this.request<ProductCatalog>(`/${catalogId}`, {}, {
      fields: fields || DEFAULT_CATALOG_FIELDS,
    });
  }

  async listProductSets(
    catalogId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProductSet>> {
    return this.request<PaginatedResponse<ProductSet>>(`/${catalogId}/product_sets`, {}, {
      fields: 'id,name,product_count,filter,retailer_id',
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  // ===========================================================================
  // Delivery Estimates
  // ===========================================================================

  async getDeliveryEstimate(
    accountId: string,
    targeting: Targeting,
    optimizationGoal: string
  ): Promise<DeliveryEstimate> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const result = await this.request<PaginatedResponse<DeliveryEstimate>>(`/${id}/delivery_estimate`, {}, {
      targeting_spec: JSON.stringify(targeting),
      optimization_goal: optimizationGoal,
    });
    return result.data[0];
  }

  // ===========================================================================
  // Reach & Frequency
  // ===========================================================================

  async getReachFrequencyPrediction(
    accountId: string,
    predictionId: string
  ): Promise<ReachFrequencyPrediction> {
    return this.request<ReachFrequencyPrediction>(`/${predictionId}`, {}, {
      fields: 'id,account_id,campaign_id,status,time_created,time_updated,external_reach,external_budget,external_impression,reach_curve,grp_curve',
    });
  }

  async createReachFrequencyPrediction(
    accountId: string,
    params: Record<string, unknown>
  ): Promise<ReachFrequencyPrediction> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const result = await this.request<{ id: string }>(`/${id}/reachfrequencypredictions`, {
      method: 'POST',
    }, params as Record<string, string | number | boolean | undefined>);

    return this.getReachFrequencyPrediction(accountId, result.id);
  }

  // ===========================================================================
  // Business Manager
  // ===========================================================================

  async getBusinesses(params?: PaginationParams): Promise<PaginatedResponse<Business>> {
    return this.request<PaginatedResponse<Business>>('/me/businesses', {}, {
      fields: 'id,name,created_time,link,primary_page,profile_picture_uri,verification_status,vertical',
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  async getBusiness(businessId: string): Promise<Business> {
    return this.request<Business>(`/${businessId}`, {}, {
      fields: 'id,name,created_by,created_time,link,primary_page,profile_picture_uri,timezone_id,verification_status,vertical',
    });
  }

  async listBusinessAdAccounts(
    businessId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<AdAccount>> {
    return this.request<PaginatedResponse<AdAccount>>(`/${businessId}/owned_ad_accounts`, {}, {
      fields: DEFAULT_AD_ACCOUNT_FIELDS,
      limit: params?.limit || 25,
      after: params?.after,
      before: params?.before,
    });
  }

  // ===========================================================================
  // Targeting Search
  // ===========================================================================

  async searchTargeting(
    accountId: string,
    type: string,
    query: string
  ): Promise<Array<{ id: string; name: string; type: string; audience_size_lower_bound?: number; audience_size_upper_bound?: number }>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const result = await this.request<PaginatedResponse<{ id: string; name: string; type: string; audience_size_lower_bound?: number; audience_size_upper_bound?: number }>>(`/${id}/targetingsearch`, {}, {
      type,
      q: query,
    });
    return result.data;
  }

  async getTargetingCategories(
    accountId: string,
    type: string
  ): Promise<Array<{ id: string; name: string; type: string }>> {
    const id = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const result = await this.request<PaginatedResponse<{ id: string; name: string; type: string }>>(`/${id}/targetingbrowse`, {}, {
      type,
    });
    return result.data;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Meta Ads client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createMetaAdsClient(credentials: TenantCredentials): MetaAdsClient {
  if (!credentials.accessToken) {
    throw new AuthenticationError('Access token is required');
  }
  return new MetaAdsClientImpl(credentials);
}
