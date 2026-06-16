export interface ShopifyOAuthState {
  shop: string;
  nonce: string;
  timestamp: number;
}

export interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

export interface ShopifyShopResponse {
  shop: {
    id: number;
    name: string;
    email: string;
    domain: string;
    myshopify_domain: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SessionPayload {
  shopId: string;
  shop: string;
  sessionId: string;
}