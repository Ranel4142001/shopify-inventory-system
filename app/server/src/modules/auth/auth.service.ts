import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { encrypt, decrypt, generateAccessToken, generateRefreshToken, verifyToken } from '../../shared/utils/tokenManager';
import { ShopifyTokenResponse, ShopifyShopResponse, AuthTokens } from './auth.types';
import { UnauthorizedError, BadRequestError } from '../../shared/errors/AppError';
import { db } from '../../db/client';
import { shops, sessions } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class AuthService {

  // ─── Generate OAuth Install URL ──────────────────────────────────────────
  generateInstallUrl(shop: string): { url: string; nonce: string } {
    const nonce = crypto.randomBytes(16).toString('hex');
    const scopes = env.SHOPIFY_SCOPES;
    const redirectUri = env.REDIRECT_URI;
    const apiKey = env.SHOPIFY_API_KEY;

    const url =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${apiKey}` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${nonce}` +
      `&grant_options[]=value`;

    return { url, nonce };
  }

  // ─── Validate HMAC from Shopify callback ─────────────────────────────────
  validateHmac(query: Record<string, string>): boolean {
    const { hmac, ...rest } = query;
    if (!hmac) return false;

    const message = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key]}`)
      .join('&');

    const generatedHmac = crypto
      .createHmac('sha256', env.SHOPIFY_API_SECRET)
      .update(message)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac),
      Buffer.from(hmac)
    );
  }

  // ─── Exchange code for access token ──────────────────────────────────────
  async exchangeCodeForToken(shop: string, code: string): Promise<string> {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.SHOPIFY_API_KEY,
        client_secret: env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      throw new BadRequestError('Failed to exchange code for token');
    }

    const data = (await response.json()) as ShopifyTokenResponse;
    return data.access_token;
  }

  // ─── Get shop info from Shopify API ──────────────────────────────────────
  async getShopInfo(shop: string, accessToken: string): Promise<ShopifyShopResponse['shop']> {
    const response = await fetch(
      `https://${shop}/admin/api/2026-04/shop.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    if (!response.ok) {
      throw new BadRequestError('Failed to fetch shop info');
    }

    const data = (await response.json()) as ShopifyShopResponse;
    return data.shop;
  }

  // ─── Upsert shop + create session ────────────────────────────────────────
  async createOrUpdateShop(
    shopDomain: string,
    accessToken: string,
    scope: string,
    shopInfo: ShopifyShopResponse['shop']
  ): Promise<AuthTokens> {
    // Check if shop exists
    const existingShop = await db
      .select()
      .from(shops)
      .where(eq(shops.domain, shopDomain))
      .limit(1);

    let shopId: string;

    if (existingShop.length > 0) {
      // Update existing shop
      shopId = existingShop[0].id;
      await db
        .update(shops)
        .set({
          accessToken: encrypt(accessToken),
          scope,
          email: shopInfo.email,
          shopName: shopInfo.name,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(shops.id, shopId));
    } else {
      // Create new shop
      shopId = uuidv4();
      await db.insert(shops).values({
        id: shopId,
        domain: shopDomain,
        accessToken: encrypt(accessToken),
        scope,
        email: shopInfo.email,
        shopName: shopInfo.name,
        isActive: true,
        installedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const jwtAccessToken = generateAccessToken({ shopId, shop: shopDomain, sessionId });
    const jwtRefreshToken = generateRefreshToken({ shopId, shop: shopDomain, sessionId });

    await db.insert(sessions).values({
      id: sessionId,
      shopId,
      accessToken: encrypt(jwtAccessToken),
      refreshToken: encrypt(jwtRefreshToken),
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
    };
  }

  // ─── Refresh tokens ───────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyToken(refreshToken);

    // Check session exists
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, payload.sessionId))
      .limit(1);

    if (!session.length) {
      throw new UnauthorizedError('Session not found');
    }

    if (new Date() > session[0].expiresAt) {
      throw new UnauthorizedError('Session expired');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      shopId: payload.shopId,
      shop: payload.shop,
      sessionId: payload.sessionId,
    });

    const newRefreshToken = generateRefreshToken({
      shopId: payload.shopId,
      shop: payload.shop,
      sessionId: payload.sessionId,
    });

    // Update session in DB
    await db
      .update(sessions)
      .set({
        accessToken: encrypt(newAccessToken),
        refreshToken: encrypt(newRefreshToken),
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, payload.sessionId));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();