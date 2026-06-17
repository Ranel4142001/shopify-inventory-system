import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/types/AuthRequest';
import { verifyToken } from '../../shared/utils/tokenManager';
import {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../../shared/middleware/cookieAuth';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { authService } from './auth.service';
import { db } from '../../db/client';
import { shops, sessions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import {
  generateAccessToken,
  generateRefreshToken,
  encrypt,
} from '../../shared/utils/tokenManager';
import { v4 as uuidv4 } from 'uuid';

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accessToken = getAccessToken(req);

    // ── Try access token first ────────────────────────────────
    if (accessToken) {
      try {
        const payload = verifyToken(accessToken);
        req.shopId = payload.shopId;
        req.shop = payload.shop;
        req.sessionId = payload.sessionId;
        req.tokenPayload = payload;
        return next();
      } catch {
        // Access token expired — try refresh
      }
    }

    // ── Try refresh token ─────────────────────────────────────
    const refreshToken = getRefreshToken(req);
    if (refreshToken) {
      try {
        const tokens = await authService.refreshTokens(refreshToken);
        setAccessTokenCookie(res, tokens.accessToken);
        setRefreshTokenCookie(res, tokens.refreshToken);

        const payload = verifyToken(tokens.accessToken);
        req.shopId = payload.shopId;
        req.shop = payload.shop;
        req.sessionId = payload.sessionId;
        req.tokenPayload = payload;
        return next();
      } catch {
        // Refresh token invalid — try shop param
      }
    }

    // ── Fallback: use shop query param to find session ────────
    // This handles the case where cookies aren't sent (iframe issue)
    const shopParam =
      (req.query.shop as string) ||
      (req.headers['x-shop-domain'] as string);

    if (shopParam) {
      // Find shop in DB
      const shopRecord = await db
        .select()
        .from(shops)
        .where(eq(shops.domain, shopParam))
        .limit(1);

      if (shopRecord.length > 0) {
        const shop = shopRecord[0];

        // Find latest session for this shop
        const sessionRecord = await db
          .select()
          .from(sessions)
          .where(eq(sessions.shopId, shop.id))
          .limit(1);

        if (sessionRecord.length > 0) {
          const sessionId = sessionRecord[0].id;

          // Generate new tokens
          const newAccessToken = generateAccessToken({
            shopId: shop.id,
            shop: shop.domain,
            sessionId,
          });
          const newRefreshToken = generateRefreshToken({
            shopId: shop.id,
            shop: shop.domain,
            sessionId,
          });

          // Set new cookies
          setAccessTokenCookie(res, newAccessToken);
          setRefreshTokenCookie(res, newRefreshToken);

          // Update session in DB
          await db
            .update(sessions)
            .set({
              accessToken: encrypt(newAccessToken),
              refreshToken: encrypt(newRefreshToken),
              updatedAt: new Date(),
            })
            .where(eq(sessions.id, sessionId));

          req.shopId = shop.id;
          req.shop = shop.domain;
          req.sessionId = sessionId;

          return next();
        }
      }
    }

    throw new UnauthorizedError('No valid session found');
  } catch (error) {
    next(error);
  }
}