import { Request } from 'express';
import { TokenPayload } from '../utils/tokenManager';

export interface AuthRequest extends Request {
  shopId?: string;
  shop?: string;
  sessionId?: string;
  tokenPayload?: TokenPayload;
}