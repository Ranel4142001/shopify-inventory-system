export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'tl_access_token',
  REFRESH_TOKEN: 'tl_refresh_token',
  SHOP: 'tl_shop',
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_MS: 15 * 60 * 1000,        // 15 minutes
  REFRESH_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const SHOPIFY_API_VERSION = '2026-04';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;