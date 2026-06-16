import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../config/env';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setShopCookie,
  clearAuthCookies,
} from '../../shared/middleware/cookieAuth';
import { BadRequestError } from '../../shared/errors/AppError';

// In-memory nonce store (use Redis in production)
const nonceStore = new Map<string, number>();

export class AuthController {

  // GET /api/auth/install?shop=xxx.myshopify.com
  install(req: Request, res: Response, next: NextFunction): void {
    try {
      const shop = req.query.shop as string;
      if (!shop) throw new BadRequestError('Missing shop parameter');

      const { url, nonce } = authService.generateInstallUrl(shop);

      // Store nonce with timestamp (expires in 10 min)
      nonceStore.set(nonce, Date.now());

      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/callback
  async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shop, code, state, hmac } = req.query as Record<string, string>;

      if (!shop || !code || !state || !hmac) {
        throw new BadRequestError('Missing required OAuth parameters');
      }

      // Validate HMAC
      if (!authService.validateHmac(req.query as Record<string, string>)) {
        throw new BadRequestError('Invalid HMAC signature');
      }

      // Validate nonce
      const nonceTimestamp = nonceStore.get(state);
      if (!nonceTimestamp || Date.now() - nonceTimestamp > 10 * 60 * 1000) {
        throw new BadRequestError('Invalid or expired state');
      }
      nonceStore.delete(state);

      // Exchange code for token
      const shopifyToken = await authService.exchangeCodeForToken(shop, code);

      // Get shop info
      const shopInfo = await authService.getShopInfo(shop, shopifyToken);

      // Create/update shop + session
      const tokens = await authService.createOrUpdateShop(
        shop,
        shopifyToken,
        env.SHOPIFY_SCOPES,
        shopInfo
      );

      // Set cookies
      setAccessTokenCookie(res, tokens.accessToken);
      setRefreshTokenCookie(res, tokens.refreshToken);
      setShopCookie(res, shop);

      // Redirect to embedded app
      res.redirect(`${env.APP_URL}?shop=${shop}`);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.tl_refresh_token;
      if (!refreshToken) throw new BadRequestError('No refresh token');

      const tokens = await authService.refreshTokens(refreshToken);

      setAccessTokenCookie(res, tokens.accessToken);
      setRefreshTokenCookie(res, tokens.refreshToken);

      res.json({ success: true, message: 'Tokens refreshed' });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  logout(req: Request, res: Response): void {
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out' });
  }
}

export const authController = new AuthController();