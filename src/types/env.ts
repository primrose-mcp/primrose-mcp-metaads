/**
 * Environment Bindings for Meta Ads MCP Server
 *
 * Type definitions for Cloudflare Worker environment variables and bindings.
 *
 * MULTI-TENANT ARCHITECTURE:
 * This server supports multiple tenants. Tenant-specific credentials (access tokens,
 * ad account IDs, etc.) are passed via request headers, NOT stored in wrangler
 * secrets. This allows a single server instance to serve multiple customers.
 *
 * Request Headers:
 * - X-Meta-Access-Token: Meta/Facebook OAuth access token (required)
 * - X-Meta-Ad-Account-Id: Default ad account ID (act_XXXX format)
 * - X-Meta-Business-Id: Business Manager ID
 * - X-Meta-App-Id: App ID (for app-scoped tokens)
 * - X-Meta-App-Secret: App secret (for server-to-server)
 */

// =============================================================================
// Tenant Credentials (parsed from request headers)
// =============================================================================

export interface TenantCredentials {
  /** Meta/Facebook OAuth access token (from X-Meta-Access-Token header) */
  accessToken: string;

  /** Default ad account ID in act_XXXX format (from X-Meta-Ad-Account-Id header) */
  adAccountId?: string;

  /** Business Manager ID (from X-Meta-Business-Id header) */
  businessId?: string;

  /** App ID for app-scoped tokens (from X-Meta-App-Id header) */
  appId?: string;

  /** App secret for server-to-server auth (from X-Meta-App-Secret header) */
  appSecret?: string;

  /** API version override (from X-Meta-Api-Version header) */
  apiVersion?: string;
}

/**
 * Parse tenant credentials from request headers
 */
export function parseTenantCredentials(request: Request): TenantCredentials {
  const headers = request.headers;

  return {
    accessToken: headers.get('X-Meta-Access-Token') || '',
    adAccountId: headers.get('X-Meta-Ad-Account-Id') || undefined,
    businessId: headers.get('X-Meta-Business-Id') || undefined,
    appId: headers.get('X-Meta-App-Id') || undefined,
    appSecret: headers.get('X-Meta-App-Secret') || undefined,
    apiVersion: headers.get('X-Meta-Api-Version') || undefined,
  };
}

/**
 * Validate that required credentials are present
 */
export function validateCredentials(credentials: TenantCredentials): void {
  if (!credentials.accessToken) {
    throw new Error('Missing credentials. Provide X-Meta-Access-Token header.');
  }
}

// =============================================================================
// Environment Configuration (from wrangler.jsonc vars and bindings)
// =============================================================================

export interface Env {
  // ===========================================================================
  // Environment Variables (from wrangler.jsonc vars)
  // ===========================================================================

  /** Maximum character limit for responses */
  CHARACTER_LIMIT: string;

  /** Default page size for list operations */
  DEFAULT_PAGE_SIZE: string;

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: string;

  /** Meta API version (e.g., v21.0) */
  META_API_VERSION: string;

  // ===========================================================================
  // Bindings
  // ===========================================================================

  /** KV namespace for OAuth token storage */
  OAUTH_KV?: KVNamespace;

  /** Durable Object namespace for MCP sessions */
  MCP_SESSIONS?: DurableObjectNamespace;

  /** Cloudflare AI binding (optional) */
  AI?: Ai;
}

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Get a numeric environment value with a default
 */
export function getEnvNumber(env: Env, key: keyof Env, defaultValue: number): number {
  const value = env[key];
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Get the character limit from environment
 */
export function getCharacterLimit(env: Env): number {
  return getEnvNumber(env, 'CHARACTER_LIMIT', 50000);
}

/**
 * Get the default page size from environment
 */
export function getDefaultPageSize(env: Env): number {
  return getEnvNumber(env, 'DEFAULT_PAGE_SIZE', 25);
}

/**
 * Get the maximum page size from environment
 */
export function getMaxPageSize(env: Env): number {
  return getEnvNumber(env, 'MAX_PAGE_SIZE', 100);
}

/**
 * Get the Meta API version from environment
 */
export function getMetaApiVersion(env: Env): string {
  return env.META_API_VERSION || 'v21.0';
}
