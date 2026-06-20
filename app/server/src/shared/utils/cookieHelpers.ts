import { Request, Response } from 'express';
import { COOKIE_NAMES, TOKEN_EXPIRY } from '../../config/constants';

const COOKIE_OPTIONS_BASE = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: TOKEN_EXPIRY.ACCESS_MS,
  });
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: TOKEN_EXPIRY.REFRESH_MS,
  });
}

export function setShopCookie(res: Response, shop: string): void {
  res.cookie(COOKIE_NAMES.SHOP, shop, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: TOKEN_EXPIRY.REFRESH_MS,
  });
}

export function getAccessToken(req: Request): string | undefined {
  return req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
}

export function getRefreshToken(req: Request): string | undefined {
  return req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
}

export function getShopFromCookie(req: Request): string | undefined {
  return req.cookies?.[COOKIE_NAMES.SHOP];
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
  res.clearCookie(COOKIE_NAMES.SHOP);
}