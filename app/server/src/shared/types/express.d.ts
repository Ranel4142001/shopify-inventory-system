import 'express';

declare module 'express' {
  interface Request {
    shop?: string;
    shopId?: string;
    sessionId?: string;
  }
}

export {};