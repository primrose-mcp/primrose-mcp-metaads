/**
 * Meta Ads Entity Types
 *
 * Type definitions for Meta Marketing API entities including:
 * - Ad Accounts
 * - Campaigns
 * - Ad Sets
 * - Ads
 * - Ad Creatives
 * - Custom Audiences
 * - Lookalike Audiences
 * - Pixels
 * - Product Catalogs
 * - Insights/Reporting
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return (default 25, max 100) */
  limit?: number;
  /** Cursor for pagination (before or after) */
  after?: string;
  before?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Paging information */
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

// =============================================================================
// Ad Account
// =============================================================================

export interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  account_status: AdAccountStatus;
  age?: number;
  amount_spent?: string;
  balance?: string;
  business?: {
    id: string;
    name: string;
  };
  business_city?: string;
  business_country_code?: string;
  business_name?: string;
  business_state?: string;
  business_street?: string;
  business_street2?: string;
  business_zip?: string;
  capabilities?: string[];
  created_time?: string;
  currency?: string;
  disable_reason?: number;
  end_advertiser?: string;
  end_advertiser_name?: string;
  funding_source?: string;
  funding_source_details?: Record<string, unknown>;
  has_migrated_permissions?: boolean;
  is_personal?: number;
  is_prepay_account?: boolean;
  min_campaign_group_spend_cap?: string;
  min_daily_budget?: number;
  owner?: string;
  partner?: string;
  spend_cap?: string;
  timezone_id?: number;
  timezone_name?: string;
  timezone_offset_hours_utc?: number;
  user_tasks?: string[];
  user_tos_accepted?: Record<string, number>;
}

export type AdAccountStatus = 1 | 2 | 3 | 7 | 8 | 9 | 100 | 101 | 201 | 202;
// 1=ACTIVE, 2=DISABLED, 3=UNSETTLED, 7=PENDING_RISK_REVIEW, 8=PENDING_SETTLEMENT
// 9=IN_GRACE_PERIOD, 100=PENDING_CLOSURE, 101=CLOSED, 201=ANY_ACTIVE, 202=ANY_CLOSED

// =============================================================================
// Campaign
// =============================================================================

export interface Campaign {
  id: string;
  account_id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  effective_status: CampaignEffectiveStatus;
  buying_type?: 'AUCTION' | 'RESERVED';
  budget_remaining?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  bid_strategy?: BidStrategy;
  special_ad_categories?: SpecialAdCategory[];
  special_ad_category?: SpecialAdCategory;
  special_ad_category_country?: string[];
  spend_cap?: string;
  start_time?: string;
  stop_time?: string;
  created_time?: string;
  updated_time?: string;
  configured_status?: CampaignStatus;
  source_campaign_id?: string;
  is_skadnetwork_attribution?: boolean;
  smart_promotion_type?: string;
  pacing_type?: string[];
  promoted_object?: PromotedObject;
  campaign_group_active_time?: string;
}

export type CampaignObjective =
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_APP_PROMOTION'
  // Legacy objectives (may still be used)
  | 'BRAND_AWARENESS'
  | 'REACH'
  | 'LINK_CLICKS'
  | 'POST_ENGAGEMENT'
  | 'VIDEO_VIEWS'
  | 'LEAD_GENERATION'
  | 'MESSAGES'
  | 'CONVERSIONS'
  | 'PRODUCT_CATALOG_SALES'
  | 'APP_INSTALLS'
  | 'STORE_VISITS';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';

export type CampaignEffectiveStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELETED'
  | 'PENDING_REVIEW'
  | 'DISAPPROVED'
  | 'PREAPPROVED'
  | 'PENDING_BILLING_INFO'
  | 'CAMPAIGN_PAUSED'
  | 'ARCHIVED'
  | 'ADSET_PAUSED'
  | 'IN_PROCESS'
  | 'WITH_ISSUES';

export type BidStrategy =
  | 'LOWEST_COST_WITHOUT_CAP'
  | 'LOWEST_COST_WITH_BID_CAP'
  | 'COST_CAP'
  | 'LOWEST_COST_WITH_MIN_ROAS';

export type SpecialAdCategory =
  | 'NONE'
  | 'EMPLOYMENT'
  | 'HOUSING'
  | 'CREDIT'
  | 'ISSUES_ELECTIONS_POLITICS'
  | 'ONLINE_GAMBLING_AND_GAMING';

export interface PromotedObject {
  pixel_id?: string;
  custom_event_type?: string;
  application_id?: string;
  object_store_url?: string;
  page_id?: string;
  offer_id?: string;
  product_catalog_id?: string;
  product_set_id?: string;
  event_id?: string;
  offline_conversion_data_set_id?: string;
  custom_conversion_id?: string;
  place_page_set_id?: string;
  fundraiser_campaign_id?: string;
  mcme_conversion_id?: string;
  omnichannel_object?: Record<string, unknown>;
  retention_days?: string;
}

export interface CampaignCreateInput {
  name: string;
  objective: CampaignObjective;
  status?: CampaignStatus;
  special_ad_categories?: SpecialAdCategory[];
  daily_budget?: number;
  lifetime_budget?: number;
  bid_strategy?: BidStrategy;
  spend_cap?: number;
  buying_type?: 'AUCTION' | 'RESERVED';
  start_time?: string;
  stop_time?: string;
  promoted_object?: PromotedObject;
}

export interface CampaignUpdateInput {
  name?: string;
  status?: CampaignStatus;
  daily_budget?: number;
  lifetime_budget?: number;
  bid_strategy?: BidStrategy;
  spend_cap?: number;
  start_time?: string;
  stop_time?: string;
}

// =============================================================================
// Ad Set
// =============================================================================

export interface AdSet {
  id: string;
  account_id: string;
  campaign_id: string;
  name: string;
  status: AdSetStatus;
  effective_status: AdSetEffectiveStatus;
  configured_status: AdSetStatus;
  billing_event: BillingEvent;
  optimization_goal: OptimizationGoal;
  bid_amount?: number;
  bid_strategy?: BidStrategy;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  start_time?: string;
  end_time?: string;
  created_time?: string;
  updated_time?: string;
  targeting?: Targeting;
  promoted_object?: PromotedObject;
  destination_type?: string;
  pacing_type?: string[];
  attribution_spec?: AttributionSpec[];
  use_new_app_click?: boolean;
  is_dynamic_creative?: boolean;
  learning_stage_info?: {
    status: string;
  };
  frequency_control_specs?: FrequencyControlSpec[];
  lifetime_imps?: number;
  lifetime_min_spend_target?: number;
  lifetime_spend_cap?: number;
  daily_min_spend_target?: number;
  daily_spend_cap?: number;
  recurring_budget_semantics?: boolean;
  source_adset_id?: string;
}

export type AdSetStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';

export type AdSetEffectiveStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELETED'
  | 'PENDING_REVIEW'
  | 'DISAPPROVED'
  | 'PREAPPROVED'
  | 'PENDING_BILLING_INFO'
  | 'CAMPAIGN_PAUSED'
  | 'ARCHIVED'
  | 'ADSET_PAUSED'
  | 'IN_PROCESS'
  | 'WITH_ISSUES';

export type BillingEvent =
  | 'APP_INSTALLS'
  | 'IMPRESSIONS'
  | 'LINK_CLICKS'
  | 'OFFER_CLAIMS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'THRUPLAY'
  | 'PURCHASE'
  | 'LISTING_INTERACTION';

export type OptimizationGoal =
  | 'NONE'
  | 'APP_INSTALLS'
  | 'AD_RECALL_LIFT'
  | 'ENGAGED_USERS'
  | 'EVENT_RESPONSES'
  | 'IMPRESSIONS'
  | 'LEAD_GENERATION'
  | 'QUALITY_LEAD'
  | 'LINK_CLICKS'
  | 'OFFSITE_CONVERSIONS'
  | 'PAGE_LIKES'
  | 'POST_ENGAGEMENT'
  | 'QUALITY_CALL'
  | 'REACH'
  | 'LANDING_PAGE_VIEWS'
  | 'VISIT_INSTAGRAM_PROFILE'
  | 'VALUE'
  | 'THRUPLAY'
  | 'DERIVED_EVENTS'
  | 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS'
  | 'CONVERSATIONS'
  | 'IN_APP_VALUE'
  | 'MESSAGING_PURCHASE_CONVERSION'
  | 'MESSAGING_APPOINTMENT_CONVERSION';

export interface AttributionSpec {
  event_type: string;
  window_days: number;
}

export interface FrequencyControlSpec {
  event: string;
  interval_days: number;
  max_frequency: number;
}

// =============================================================================
// Targeting
// =============================================================================

export interface Targeting {
  age_min?: number;
  age_max?: number;
  genders?: number[];
  geo_locations?: GeoLocations;
  excluded_geo_locations?: GeoLocations;
  locales?: number[];
  publisher_platforms?: PublisherPlatform[];
  facebook_positions?: FacebookPosition[];
  instagram_positions?: InstagramPosition[];
  messenger_positions?: MessengerPosition[];
  audience_network_positions?: AudienceNetworkPosition[];
  device_platforms?: DevicePlatform[];
  flexible_spec?: FlexibleSpec[];
  exclusions?: FlexibleSpec;
  custom_audiences?: CustomAudienceRef[];
  excluded_custom_audiences?: CustomAudienceRef[];
  connections?: Connection[];
  excluded_connections?: Connection[];
  friends_of_connections?: Connection[];
  interests?: Interest[];
  behaviors?: Behavior[];
  life_events?: LifeEvent[];
  industries?: Industry[];
  income?: Income[];
  family_statuses?: FamilyStatus[];
  education_schools?: EducationSchool[];
  education_statuses?: number[];
  college_years?: number[];
  relationship_statuses?: number[];
  work_employers?: WorkEmployer[];
  work_positions?: WorkPosition[];
  targeting_optimization?: string;
  brand_safety_content_filter_levels?: string[];
  targeting_relaxation_types?: string;
}

export interface GeoLocations {
  countries?: string[];
  regions?: Array<{ key: string }>;
  cities?: Array<{ key: string; radius?: number; distance_unit?: string }>;
  zips?: Array<{ key: string }>;
  geo_markets?: Array<{ key: string }>;
  location_types?: LocationType[];
  country_groups?: string[];
}

export type LocationType = 'home' | 'recent' | 'travel_in';

export type PublisherPlatform = 'facebook' | 'instagram' | 'messenger' | 'audience_network';

export type FacebookPosition =
  | 'feed'
  | 'right_hand_column'
  | 'instant_article'
  | 'marketplace'
  | 'video_feeds'
  | 'story'
  | 'search'
  | 'instream_video'
  | 'facebook_reels'
  | 'facebook_reels_overlay';

export type InstagramPosition =
  | 'stream'
  | 'story'
  | 'explore'
  | 'explore_home'
  | 'reels'
  | 'profile_feed'
  | 'ig_search'
  | 'profile_reels';

export type MessengerPosition = 'messenger_home' | 'sponsored_messages' | 'story';

export type AudienceNetworkPosition =
  | 'classic'
  | 'instream_video'
  | 'rewarded_video';

export type DevicePlatform = 'mobile' | 'desktop';

export interface FlexibleSpec {
  interests?: Interest[];
  behaviors?: Behavior[];
  demographics?: Demographic[];
  life_events?: LifeEvent[];
  industries?: Industry[];
  income?: Income[];
  family_statuses?: FamilyStatus[];
  education_schools?: EducationSchool[];
  work_employers?: WorkEmployer[];
  work_positions?: WorkPosition[];
}

export interface Interest {
  id: string;
  name: string;
}

export interface Behavior {
  id: string;
  name: string;
}

export interface Demographic {
  id: string;
  name: string;
}

export interface LifeEvent {
  id: string;
  name: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Income {
  id: string;
  name: string;
}

export interface FamilyStatus {
  id: string;
  name: string;
}

export interface EducationSchool {
  id: string;
  name: string;
}

export interface WorkEmployer {
  id: string;
  name: string;
}

export interface WorkPosition {
  id: string;
  name: string;
}

export interface CustomAudienceRef {
  id: string;
  name?: string;
}

export interface Connection {
  id: string;
  name?: string;
}

export interface AdSetCreateInput {
  campaign_id: string;
  name: string;
  billing_event: BillingEvent;
  optimization_goal: OptimizationGoal;
  status?: AdSetStatus;
  targeting: Targeting;
  bid_amount?: number;
  bid_strategy?: BidStrategy;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  promoted_object?: PromotedObject;
  destination_type?: string;
  attribution_spec?: AttributionSpec[];
  is_dynamic_creative?: boolean;
  pacing_type?: string[];
}

export interface AdSetUpdateInput {
  name?: string;
  status?: AdSetStatus;
  targeting?: Targeting;
  bid_amount?: number;
  bid_strategy?: BidStrategy;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  optimization_goal?: OptimizationGoal;
  billing_event?: BillingEvent;
}

// =============================================================================
// Ad
// =============================================================================

export interface Ad {
  id: string;
  account_id: string;
  adset_id: string;
  campaign_id: string;
  name: string;
  status: AdStatus;
  effective_status: AdEffectiveStatus;
  configured_status: AdStatus;
  creative?: AdCreative;
  tracking_specs?: TrackingSpec[];
  conversion_specs?: ConversionSpec[];
  created_time?: string;
  updated_time?: string;
  bid_amount?: number;
  bid_type?: string;
  last_updated_by_app_id?: string;
  source_ad_id?: string;
  recommendations?: AdRecommendation[];
  preview_shareable_link?: string;
}

export type AdStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';

export type AdEffectiveStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'DELETED'
  | 'PENDING_REVIEW'
  | 'DISAPPROVED'
  | 'PREAPPROVED'
  | 'PENDING_BILLING_INFO'
  | 'CAMPAIGN_PAUSED'
  | 'ARCHIVED'
  | 'ADSET_PAUSED'
  | 'IN_PROCESS'
  | 'WITH_ISSUES';

export interface TrackingSpec {
  'action.type'?: string[];
  fb_pixel?: string[];
  application?: string[];
  post?: string[];
  page?: string[];
  offer?: string[];
  product_set_id?: string[];
}

export interface ConversionSpec {
  'action.type'?: string[];
  fb_pixel?: string[];
  application?: string[];
  post?: string[];
  page?: string[];
  offer?: string[];
  conversion_id?: string[];
}

export interface AdRecommendation {
  blame_field?: string;
  code?: number;
  confidence?: string;
  importance?: string;
  message?: string;
  title?: string;
}

export interface AdCreateInput {
  adset_id: string;
  name: string;
  creative: AdCreativeInput;
  status?: AdStatus;
  tracking_specs?: TrackingSpec[];
  conversion_specs?: ConversionSpec[];
}

export interface AdUpdateInput {
  name?: string;
  status?: AdStatus;
  creative?: AdCreativeInput;
  tracking_specs?: TrackingSpec[];
}

// =============================================================================
// Ad Creative
// =============================================================================

export interface AdCreative {
  id: string;
  account_id: string;
  name?: string;
  title?: string;
  body?: string;
  call_to_action_type?: CallToActionType;
  image_hash?: string;
  image_url?: string;
  video_id?: string;
  thumbnail_url?: string;
  link_url?: string;
  object_story_spec?: ObjectStorySpec;
  object_type?: string;
  object_url?: string;
  asset_feed_spec?: AssetFeedSpec;
  degrees_of_freedom_spec?: DegreesOfFreedomSpec;
  status?: string;
  effective_object_story_id?: string;
  instagram_actor_id?: string;
  instagram_permalink_url?: string;
  source_instagram_media_id?: string;
  use_page_actor_override?: boolean;
  actor_id?: string;
  url_tags?: string;
  authorization_category?: string;
  created_time?: string;
}

export type CallToActionType =
  | 'BOOK_TRAVEL'
  | 'CONTACT_US'
  | 'DONATE'
  | 'DONATE_NOW'
  | 'DOWNLOAD'
  | 'GET_DIRECTIONS'
  | 'GET_OFFER'
  | 'GET_OFFER_VIEW'
  | 'GET_QUOTE'
  | 'GET_SHOWTIMES'
  | 'INSTALL_APP'
  | 'INSTALL_MOBILE_APP'
  | 'LEARN_MORE'
  | 'LIKE_PAGE'
  | 'LISTEN_MUSIC'
  | 'LISTEN_NOW'
  | 'MESSAGE_PAGE'
  | 'MOBILE_DOWNLOAD'
  | 'NO_BUTTON'
  | 'OPEN_LINK'
  | 'ORDER_NOW'
  | 'PAY_TO_ACCESS'
  | 'PLAY_GAME'
  | 'PLAY_GAME_ON_FACEBOOK'
  | 'PURCHASE_GIFT_CARDS'
  | 'RECORD_NOW'
  | 'REFER_FRIENDS'
  | 'REQUEST_TIME'
  | 'SAY_THANKS'
  | 'SEE_MORE'
  | 'SELL_NOW'
  | 'SEND_A_GIFT'
  | 'SHARE'
  | 'SHOP_NOW'
  | 'SIGN_UP'
  | 'SUBSCRIBE'
  | 'UPDATE_APP'
  | 'USE_APP'
  | 'USE_MOBILE_APP'
  | 'VIDEO_ANNOTATION'
  | 'VISIT_PAGES_FEED'
  | 'WATCH_MORE'
  | 'WATCH_VIDEO'
  | 'WHATSAPP_MESSAGE'
  | 'WOODHENGE_SUPPORT';

export interface ObjectStorySpec {
  page_id: string;
  link_data?: LinkData;
  video_data?: VideoData;
  photo_data?: PhotoData;
  text_data?: TextData;
  template_data?: TemplateData;
  instagram_actor_id?: string;
}

export interface LinkData {
  link: string;
  message?: string;
  name?: string;
  description?: string;
  caption?: string;
  image_hash?: string;
  image_crops?: Record<string, number[][]>;
  call_to_action?: CallToAction;
  attachment_style?: string;
  child_attachments?: ChildAttachment[];
  multi_share_optimized?: boolean;
  multi_share_end_card?: boolean;
  retailer_item_ids?: string[];
}

export interface VideoData {
  video_id: string;
  title?: string;
  message?: string;
  image_url?: string;
  image_hash?: string;
  call_to_action?: CallToAction;
  link_description?: string;
}

export interface PhotoData {
  image_hash: string;
  caption?: string;
  url?: string;
}

export interface TextData {
  message: string;
}

export interface TemplateData {
  description?: string;
  link?: string;
  message?: string;
  name?: string;
  format_option?: string;
  additional_image_index?: number;
  call_to_action?: CallToAction;
  multi_share_optimized?: boolean;
  show_multiple_images?: boolean;
}

export interface CallToAction {
  type: CallToActionType;
  value?: {
    link?: string;
    app_destination?: string;
    app_link?: string;
    lead_gen_form_id?: string;
    page?: string;
  };
}

export interface ChildAttachment {
  link: string;
  name?: string;
  description?: string;
  image_hash?: string;
  video_id?: string;
  call_to_action?: CallToAction;
}

export interface AssetFeedSpec {
  images?: Array<{ hash: string }>;
  videos?: Array<{ video_id: string; thumbnail_hash?: string }>;
  bodies?: Array<{ text: string }>;
  titles?: Array<{ text: string }>;
  descriptions?: Array<{ text: string }>;
  link_urls?: Array<{ website_url: string }>;
  call_to_action_types?: CallToActionType[];
  ad_formats?: string[];
  optimization_type?: string;
}

export interface DegreesOfFreedomSpec {
  creative_features_spec?: {
    standard_enhancements?: {
      enroll_status: string;
    };
  };
}

export interface AdCreativeInput {
  name?: string;
  object_story_spec?: ObjectStorySpec;
  asset_feed_spec?: AssetFeedSpec;
  degrees_of_freedom_spec?: DegreesOfFreedomSpec;
  url_tags?: string;
  use_page_actor_override?: boolean;
  authorization_category?: string;
}

// =============================================================================
// Ad Image
// =============================================================================

export interface AdImage {
  id: string;
  account_id: string;
  hash: string;
  name?: string;
  url?: string;
  url_128?: string;
  permalink_url?: string;
  original_height?: number;
  original_width?: number;
  status?: string;
  created_time?: string;
  updated_time?: string;
}

// =============================================================================
// Ad Video
// =============================================================================

export interface AdVideo {
  id: string;
  account_id?: string;
  title?: string;
  description?: string;
  source?: string;
  picture?: string;
  permalink_url?: string;
  length?: number;
  status?: {
    video_status: string;
    processing_progress?: number;
    uploading_phase?: {
      status: string;
    };
  };
  created_time?: string;
  updated_time?: string;
}

// =============================================================================
// Custom Audience
// =============================================================================

export interface CustomAudience {
  id: string;
  account_id: string;
  name: string;
  description?: string;
  subtype: CustomAudienceSubtype;
  approximate_count_lower_bound?: number;
  approximate_count_upper_bound?: number;
  customer_file_source?: string;
  data_source?: {
    type: string;
    sub_type: string;
    creation_params?: string;
  };
  delivery_status?: {
    code: number;
    description: string;
  };
  external_event_source?: {
    id: string;
    name: string;
    source_type: string;
  };
  is_value_based?: boolean;
  lookalike_audience_ids?: string[];
  lookalike_spec?: LookalikeSpec;
  operation_status?: {
    code: number;
    description: string;
  };
  opt_out_link?: string;
  owner_business?: {
    id: string;
    name: string;
  };
  permission_for_actions?: {
    can_edit: boolean;
    can_see_insight: boolean;
    can_share: boolean;
    subtype_supports_lookalike: boolean;
    supports_recipient_lookalike: boolean;
  };
  pixel_id?: string;
  retention_days?: number;
  rule?: string;
  rule_aggregation?: string;
  sharing_status?: {
    code: number;
    description: string;
  };
  time_content_updated?: number;
  time_created?: number;
  time_updated?: number;
}

export type CustomAudienceSubtype =
  | 'CUSTOM'
  | 'WEBSITE'
  | 'APP'
  | 'OFFLINE_CONVERSION'
  | 'CLAIM'
  | 'PARTNER'
  | 'MANAGED'
  | 'VIDEO'
  | 'LOOKALIKE'
  | 'ENGAGEMENT'
  | 'BAG_OF_ACCOUNTS'
  | 'STUDY_RULE_AUDIENCE'
  | 'FOX';

export interface LookalikeSpec {
  country?: string;
  is_financial_service?: boolean;
  origin?: Array<{ id: string; type: string }>;
  origin_event_name?: string;
  origin_event_source_name?: string;
  origin_event_source_type?: string;
  product_set_id?: string;
  ratio?: number;
  starting_ratio?: number;
  type?: string;
}

export interface CustomAudienceCreateInput {
  name: string;
  subtype: CustomAudienceSubtype;
  description?: string;
  customer_file_source?: 'USER_PROVIDED_ONLY' | 'PARTNER_PROVIDED_ONLY' | 'BOTH_USER_AND_PARTNER_PROVIDED';
  pixel_id?: string;
  rule?: string;
  prefill?: boolean;
  retention_days?: number;
  lookalike_spec?: {
    origin_audience_id: string;
    ratio: number;
    country: string;
  };
}

export interface CustomAudienceUpdateInput {
  name?: string;
  description?: string;
  opt_out_link?: string;
}

// =============================================================================
// Pixel
// =============================================================================

export interface Pixel {
  id: string;
  name: string;
  code?: string;
  creation_time?: string;
  creator?: {
    id: string;
    name: string;
  };
  data_use_setting?: string;
  enable_automatic_matching?: boolean;
  first_party_cookie_status?: string;
  is_created_by_business?: boolean;
  is_unavailable?: boolean;
  last_fired_time?: string;
  owner_business?: {
    id: string;
    name: string;
  };
  owner_ad_account?: {
    id: string;
    name: string;
  };
}

export interface PixelCreateInput {
  name: string;
}

// =============================================================================
// Product Catalog
// =============================================================================

export interface ProductCatalog {
  id: string;
  name: string;
  business?: {
    id: string;
    name: string;
  };
  da_display_settings?: {
    carousel_ad_settings?: Record<string, unknown>;
    collection_ad_settings?: Record<string, unknown>;
    shop_ad_settings?: Record<string, unknown>;
  };
  default_image_url?: string;
  fallback_image_url?: string[];
  feed_count?: number;
  is_catalog_segment?: boolean;
  product_count?: number;
  store_catalog_settings?: {
    page?: string;
  };
  vertical?: string;
}

export interface ProductSet {
  id: string;
  name: string;
  product_catalog?: {
    id: string;
    name: string;
  };
  product_count?: number;
  filter?: string;
  auto_creation_url?: string;
  retailer_id?: string;
}

// =============================================================================
// Insights
// =============================================================================

export interface InsightsParams {
  date_preset?: DatePreset;
  time_range?: {
    since: string;
    until: string;
  };
  time_increment?: string | number;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  fields?: InsightsField[];
  breakdowns?: InsightsBreakdown[];
  action_breakdowns?: ActionBreakdown[];
  action_attribution_windows?: AttributionWindow[];
  filtering?: InsightsFilter[];
  sort?: string[];
  limit?: number;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'maximum'
  | 'data_maximum'
  | 'last_3d'
  | 'last_7d'
  | 'last_14d'
  | 'last_28d'
  | 'last_30d'
  | 'last_90d'
  | 'last_week_mon_sun'
  | 'last_week_sun_sat'
  | 'last_quarter'
  | 'last_year'
  | 'this_week_mon_today'
  | 'this_week_sun_today'
  | 'this_year';

export type InsightsField =
  | 'account_currency'
  | 'account_id'
  | 'account_name'
  | 'action_values'
  | 'actions'
  | 'ad_id'
  | 'ad_name'
  | 'adset_id'
  | 'adset_name'
  | 'campaign_id'
  | 'campaign_name'
  | 'clicks'
  | 'conversions'
  | 'conversion_values'
  | 'cost_per_action_type'
  | 'cost_per_conversion'
  | 'cost_per_inline_link_click'
  | 'cost_per_inline_post_engagement'
  | 'cost_per_unique_click'
  | 'cost_per_unique_inline_link_click'
  | 'cpc'
  | 'cpm'
  | 'cpp'
  | 'ctr'
  | 'date_start'
  | 'date_stop'
  | 'frequency'
  | 'impressions'
  | 'inline_link_click_ctr'
  | 'inline_link_clicks'
  | 'inline_post_engagement'
  | 'objective'
  | 'optimization_goal'
  | 'purchase_roas'
  | 'reach'
  | 'social_spend'
  | 'spend'
  | 'unique_clicks'
  | 'unique_ctr'
  | 'unique_inline_link_click_ctr'
  | 'unique_inline_link_clicks'
  | 'unique_link_clicks_ctr'
  | 'video_avg_time_watched_actions'
  | 'video_p100_watched_actions'
  | 'video_p25_watched_actions'
  | 'video_p50_watched_actions'
  | 'video_p75_watched_actions'
  | 'video_p95_watched_actions'
  | 'video_play_actions'
  | 'video_thruplay_watched_actions'
  | 'website_ctr'
  | 'website_purchase_roas';

export type InsightsBreakdown =
  | 'ad_format_asset'
  | 'age'
  | 'body_asset'
  | 'call_to_action_asset'
  | 'country'
  | 'description_asset'
  | 'device_platform'
  | 'dma'
  | 'frequency_value'
  | 'gender'
  | 'hourly_stats_aggregated_by_advertiser_time_zone'
  | 'hourly_stats_aggregated_by_audience_time_zone'
  | 'image_asset'
  | 'impression_device'
  | 'link_url_asset'
  | 'place_page_id'
  | 'platform_position'
  | 'product_id'
  | 'publisher_platform'
  | 'region'
  | 'skan_conversion_id'
  | 'title_asset'
  | 'video_asset';

export type ActionBreakdown =
  | 'action_canvas_component_name'
  | 'action_carousel_card_id'
  | 'action_carousel_card_name'
  | 'action_destination'
  | 'action_device'
  | 'action_reaction'
  | 'action_target_id'
  | 'action_type'
  | 'action_video_sound'
  | 'action_video_type';

export type AttributionWindow =
  | '1d_click'
  | '7d_click'
  | '28d_click'
  | '1d_view';

export interface InsightsFilter {
  field: string;
  operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'IN_RANGE' | 'NOT_IN_RANGE' | 'CONTAIN' | 'NOT_CONTAIN' | 'IN' | 'NOT_IN' | 'ANY' | 'ALL' | 'NONE';
  value: string | number | string[] | number[];
}

export interface Insights {
  account_currency?: string;
  account_id?: string;
  account_name?: string;
  action_values?: ActionValue[];
  actions?: Action[];
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  clicks?: string;
  conversions?: ActionValue[];
  conversion_values?: ActionValue[];
  cost_per_action_type?: ActionValue[];
  cost_per_conversion?: ActionValue[];
  cost_per_inline_link_click?: string;
  cost_per_inline_post_engagement?: string;
  cost_per_unique_click?: string;
  cost_per_unique_inline_link_click?: string;
  cpc?: string;
  cpm?: string;
  cpp?: string;
  ctr?: string;
  date_start?: string;
  date_stop?: string;
  frequency?: string;
  impressions?: string;
  inline_link_click_ctr?: string;
  inline_link_clicks?: string;
  inline_post_engagement?: string;
  objective?: string;
  optimization_goal?: string;
  purchase_roas?: ActionValue[];
  reach?: string;
  social_spend?: string;
  spend?: string;
  unique_clicks?: string;
  unique_ctr?: string;
  unique_inline_link_click_ctr?: string;
  unique_inline_link_clicks?: string;
  unique_link_clicks_ctr?: string;
  video_avg_time_watched_actions?: ActionValue[];
  video_p100_watched_actions?: ActionValue[];
  video_p25_watched_actions?: ActionValue[];
  video_p50_watched_actions?: ActionValue[];
  video_p75_watched_actions?: ActionValue[];
  video_p95_watched_actions?: ActionValue[];
  video_play_actions?: ActionValue[];
  video_thruplay_watched_actions?: ActionValue[];
  website_ctr?: ActionValue[];
  website_purchase_roas?: ActionValue[];
  // Breakdown fields
  age?: string;
  gender?: string;
  country?: string;
  region?: string;
  dma?: string;
  device_platform?: string;
  publisher_platform?: string;
  platform_position?: string;
  impression_device?: string;
  product_id?: string;
}

export interface Action {
  action_type: string;
  value: string;
  '1d_click'?: string;
  '7d_click'?: string;
  '28d_click'?: string;
  '1d_view'?: string;
}

export interface ActionValue {
  action_type: string;
  value: string;
  '1d_click'?: string;
  '7d_click'?: string;
  '28d_click'?: string;
  '1d_view'?: string;
}

// =============================================================================
// Delivery Estimate
// =============================================================================

export interface DeliveryEstimate {
  daily_outcomes_curve?: Array<{
    spend: number;
    reach: number;
    impressions: number;
    actions: number;
  }>;
  estimate_dau?: number;
  estimate_mau?: number;
  estimate_mau_lower_bound?: number;
  estimate_mau_upper_bound?: number;
  estimate_ready?: boolean;
}

// =============================================================================
// Reach and Frequency
// =============================================================================

export interface ReachFrequencyPrediction {
  id: string;
  account_id: string;
  campaign_id?: string;
  status?: number;
  story_event_type?: number;
  time_created?: string;
  time_updated?: string;
  external_budget?: number;
  external_impression?: number;
  external_maximum_budget?: number;
  external_maximum_impression?: number;
  external_maximum_reach?: number;
  external_minimum_budget?: number;
  external_minimum_impression?: number;
  external_minimum_reach?: number;
  external_reach?: number;
  frequency_cap?: number;
  grp_audience_size?: number;
  grp_avg_probability_map?: string;
  grp_curve?: Record<string, unknown>;
  grp_dmas_audience_size?: number;
  grp_reach_curve?: number[];
  grp_status?: string;
  holdout_percentage?: number;
  instagram_destination_id?: string;
  interval_frequency_cap?: number;
  interval_frequency_cap_reset_period?: number;
  is_io?: boolean;
  is_reserved_buying?: number;
  num_curve_points?: number;
  prediction_progress?: number;
  reach_curve?: number[];
  reservation_status?: number;
  target_audience_size?: number;
  target_spec?: Targeting;
}

// =============================================================================
// Business Manager
// =============================================================================

export interface Business {
  id: string;
  name: string;
  created_by?: {
    id: string;
    name: string;
  };
  created_time?: string;
  link?: string;
  payment_account_id?: string;
  primary_page?: {
    id: string;
    name: string;
  };
  profile_picture_uri?: string;
  timezone_id?: number;
  two_factor_type?: string;
  updated_by?: {
    id: string;
    name: string;
  };
  updated_time?: string;
  verification_status?: string;
  vertical?: string;
  vertical_id?: number;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
