import { env } from '../../config/env';
import { SHOPIFY_API_VERSION } from '../../config/constants';

export function getShopifyRestUrl(shop: string, endpoint: string): string {
  return `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}`;
}

export async function shopifyRestRequest<T>(
  shop: string,
  accessToken: string,
  endpoint: string,
  method: string = 'GET',
  body?: unknown
): Promise<T> {
  const url = getShopifyRestUrl(shop, endpoint);
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}