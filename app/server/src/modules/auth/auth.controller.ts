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
    const embedded = req.query.embedded as string;

    if (!shop) throw new BadRequestError('Missing shop parameter');

    // embedded=1 means app is already installed
    // Shopify is loading our app inside the iframe
    // Just serve the frontend index.html
    if (embedded === '1') {
      const path = require('path');
      const fs = require('fs');
      const frontendDist = path.resolve(
        __dirname,
        '../../../../client/dist'
      );
      const indexPath = path.join(frontendDist, 'index.html');

      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Dev mode — redirect to Vite
        res.redirect(`http://localhost:5173?shop=${shop}`);
      }
      return;
    }

    // Normal first-time OAuth install
    const { url, nonce } = authService.generateInstallUrl(shop);
    nonceStore.set(nonce, Date.now());
    res.redirect(url);
  } catch (error) {
    next(error);
  }
}

  // GET /api/auth/callback
  async callback(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { shop, code, state, hmac } = req.query as Record<string, string>;

    if (!shop || !code || !state || !hmac) {
      throw new BadRequestError('Missing required OAuth parameters');
    }

    if (!authService.validateHmac(req.query as Record<string, string>)) {
      throw new BadRequestError('Invalid HMAC signature');
    }

    const nonceTimestamp = nonceStore.get(state);
    if (!nonceTimestamp || Date.now() - nonceTimestamp > 10 * 60 * 1000) {
      throw new BadRequestError('Invalid or expired state');
    }
    nonceStore.delete(state);

    const shopifyToken = await authService.exchangeCodeForToken(shop, code);
    const shopInfo = await authService.getShopInfo(shop, shopifyToken);
    const tokens = await authService.createOrUpdateShop(
      shop,
      shopifyToken,
      env.SHOPIFY_SCOPES,
      shopInfo
    );

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);
    setShopCookie(res, shop);

    // Build embedded app URL
    const storeName = shop.replace('.myshopify.com', '');
    const host = Buffer.from(
      `admin.shopify.com/store/${storeName}`
    ).toString('base64url');

    const redirectUrl = `https://admin.shopify.com/store/${storeName}/apps/${env.SHOPIFY_API_KEY}?shop=${shop}&host=${host}`;

    // IMPORTANT: Use top-level JS redirect
    // A normal res.redirect() inside an OAuth flow
    // ends up inside Shopify's iframe which can't
    // redirect to admin.shopify.com (blocked by X-Frame-Options)
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Installing Group Buy Manager...</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #F6F6F7;
            }
            .card {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 12px;
              border: 1px solid #E5E7EB;
            }
            p { color: #6B7280; font-size: 14px; }
          </style>
          <script>
            try {
              if (window.top && window.top !== window) {
                window.top.location.href = ${JSON.stringify(redirectUrl)};
              } else {
                window.location.href = ${JSON.stringify(redirectUrl)};
              }
            } catch(e) {
              window.location.href = ${JSON.stringify(redirectUrl)};
            }
          </script>
        </head>
        <body>
          <div class="card">
            <p>✅ App installed! Redirecting to Shopify Admin...</p>
            <p>
              <a href="${redirectUrl}">
                Click here if not redirected automatically
              </a>
            </p>
          </div>
        </body>
      </html>
    `);
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