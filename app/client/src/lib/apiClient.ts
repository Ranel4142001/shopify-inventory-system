// Centralized API client — all fetch calls go through here
// This is framework-independent: no React imports

const BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; statusCode: number };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

function getShop(): string {
  // Try URL params first
  const params = new URLSearchParams(window.location.search);
  const shopFromUrl = params.get('shop');
  if (shopFromUrl) return shopFromUrl;

  // Try sessionStorage fallback
  const shopFromStorage = sessionStorage.getItem('tl_shop');
  if (shopFromStorage) return shopFromStorage;

  return '';
}

// Store shop on load
(function () {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get('shop');
  if (shop) sessionStorage.setItem('tl_shop', shop);
})();

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const shop = getShop();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${shop ? `${separator}shop=${shop}` : ''}`;

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(shop ? { 'x-shop-domain': shop } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (shop) {
      window.location.href = `/api/auth/install?shop=${shop}`;
    }
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  return data as ApiResponse<T>;
}

export const apiClient = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};