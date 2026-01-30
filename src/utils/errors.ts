/**
 * Error Handling Utilities for Meta Ads API
 *
 * Custom error classes and error handling helpers.
 */

/**
 * Base Meta Ads API error
 */
export class MetaAdsApiError extends Error {
  public statusCode?: number;
  public code: string;
  public errorSubcode?: number;
  public errorUserTitle?: string;
  public errorUserMsg?: string;
  public fbTraceId?: string;
  public retryable: boolean;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    retryable = false,
    extra?: {
      errorSubcode?: number;
      errorUserTitle?: string;
      errorUserMsg?: string;
      fbTraceId?: string;
    }
  ) {
    super(message);
    this.name = 'MetaAdsApiError';
    this.statusCode = statusCode;
    this.code = code || 'META_ADS_ERROR';
    this.retryable = retryable;
    if (extra) {
      this.errorSubcode = extra.errorSubcode;
      this.errorUserTitle = extra.errorUserTitle;
      this.errorUserMsg = extra.errorUserMsg;
      this.fbTraceId = extra.fbTraceId;
    }
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends MetaAdsApiError {
  public retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number, fbTraceId?: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, { fbTraceId });
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends MetaAdsApiError {
  constructor(message: string, errorSubcode?: number, fbTraceId?: string) {
    super(message, 401, 'AUTHENTICATION_FAILED', false, { errorSubcode, fbTraceId });
    this.name = 'AuthenticationError';
  }
}

/**
 * Permission error
 */
export class PermissionError extends MetaAdsApiError {
  constructor(message: string, errorSubcode?: number, fbTraceId?: string) {
    super(message, 403, 'PERMISSION_DENIED', false, { errorSubcode, fbTraceId });
    this.name = 'PermissionError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends MetaAdsApiError {
  constructor(entityType: string, id: string, fbTraceId?: string) {
    super(`${entityType} with ID '${id}' not found`, 404, 'NOT_FOUND', false, { fbTraceId });
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends MetaAdsApiError {
  public details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}, fbTraceId?: string) {
    super(message, 400, 'VALIDATION_ERROR', false, { fbTraceId });
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Parse Meta API error response
 */
export function parseMetaApiError(errorBody: Record<string, unknown>, statusCode: number): MetaAdsApiError {
  const error = errorBody.error as Record<string, unknown> | undefined;

  if (!error) {
    return new MetaAdsApiError(
      `API error: ${statusCode}`,
      statusCode,
      'UNKNOWN_ERROR',
      false
    );
  }

  const message = (error.message as string) || 'Unknown error';
  const code = error.code as number | undefined;
  const errorSubcode = error.error_subcode as number | undefined;
  const errorUserTitle = error.error_user_title as string | undefined;
  const errorUserMsg = error.error_user_msg as string | undefined;
  const fbTraceId = error.fbtrace_id as string | undefined;

  // OAuth errors (code 190)
  if (code === 190) {
    return new AuthenticationError(message, errorSubcode, fbTraceId);
  }

  // Permission errors (codes 10, 200-299)
  if (code === 10 || (code && code >= 200 && code < 300)) {
    return new PermissionError(message, errorSubcode, fbTraceId);
  }

  // Rate limit errors (code 4, 17, 32, 613)
  if (code === 4 || code === 17 || code === 32 || code === 613) {
    // Default retry after 60 seconds
    return new RateLimitError(message, 60, fbTraceId);
  }

  // Validation errors (code 100)
  if (code === 100) {
    return new ValidationError(message, {}, fbTraceId);
  }

  // Default error
  return new MetaAdsApiError(
    message,
    statusCode,
    code ? String(code) : 'UNKNOWN_ERROR',
    false,
    { errorSubcode, errorUserTitle, errorUserMsg, fbTraceId }
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof MetaAdsApiError) {
    return error.retryable;
  }
  if (error instanceof Error) {
    // Network errors are typically retryable
    return (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET')
    );
  }
  return false;
}

/**
 * Format an error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof MetaAdsApiError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      ...(error instanceof RateLimitError && { retryAfterSeconds: error.retryAfterSeconds }),
      ...(error instanceof ValidationError && { details: error.details }),
      ...(error.errorSubcode && { errorSubcode: error.errorSubcode }),
      ...(error.errorUserTitle && { errorUserTitle: error.errorUserTitle }),
      ...(error.errorUserMsg && { errorUserMsg: error.errorUserMsg }),
      ...(error.fbTraceId && { fbTraceId: error.fbTraceId }),
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}
