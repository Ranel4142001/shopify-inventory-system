import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/tokenManager';
import { getAccessToken, getRefreshToken, setAccessTokenCookie, setRefreshTokenCookie } from '../../shared/middleware/cookieAuth';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { authService } from './auth.service';
import { AuthRequest } from '../../shared/types/AuthRequest';

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accessToken = getAccessToken(req);

    if (accessToken) {
      try {
        // Verify access token
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

    // Try refresh token
    const refreshToken = getRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedError('No valid session found');
    }

    const tokens = await authService.refreshTokens(refreshToken);

    // Set new cookies
    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    // Attach to request
    const payload = verifyToken(tokens.accessToken);
    req.shopId = payload.shopId;
    req.shop = payload.shop;
    req.sessionId = payload.sessionId;
    req.tokenPayload = payload;

    next();
  } catch (error) {
    next(error);
  }
}