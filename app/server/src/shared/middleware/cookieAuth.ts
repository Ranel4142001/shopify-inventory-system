import { Request, Response, NextFunction } from 'express';
import { getAccessToken, verifyToken } from '../utils'; 
import { UnauthorizedError } from '../errors/AppError';

export function cookieAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getAccessToken(req);

  if (!token) {
    throw new UnauthorizedError('Authentication token missing');
  }

  // Verify and attach decoded data to request state
  const payload = verifyToken(token);
  req.shop = payload.shop; // Ensure your custom express.d.ts supports this property!

  next();
}