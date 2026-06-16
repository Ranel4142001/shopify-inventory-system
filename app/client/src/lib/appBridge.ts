// Shopify App Bridge setup
// Handles embedded app communication with Shopify Admin

export function getShopFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('shop');
}

export function getHostFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('host');
}

export function isEmbedded(): boolean {
  return window !== window.parent;
}

export function redirectToAuth(shop: string): void {
  window.location.href = `/api/auth/install?shop=${shop}`;
}