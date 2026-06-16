import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalRateLimiter } from './shared/middleware/rateLimiter';
import { requestLogger } from './shared/middleware/requestLogger';
import { errorHandler } from './shared/middleware/errorHandler';
import router from './router';

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameSrc: ["'self'", 'https://*.myshopify.com', 'https://admin.shopify.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.shopify.com'],
        connectSrc: ["'self'", 'https://*.myshopify.com'],
      },
    },
    // Required for Shopify embedded apps
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      env.APP_URL,
      'https://admin.shopify.com',
      /\.myshopify\.com$/,
    ],
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token'],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Cookie parsing ────────────────────────────────────────────────────────────
app.use(cookieParser(env.COOKIE_SECRET));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      statusCode: 404,
    },
  });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;