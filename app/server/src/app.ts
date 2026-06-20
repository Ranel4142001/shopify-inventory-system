import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { globalRateLimiter } from './shared/middleware/rateLimiter';
import { requestLogger } from './shared/middleware/requestLogger';
import { errorHandler } from './shared/middleware/errorHandler';
import router from './router';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
)

// Shopify frame-ancestors (REQUIRED for embedded apps) 
// This allows Shopify Admin to embed our app in an iframe
app.use((_req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    `frame-ancestors https://admin.shopify.com https://*.myshopify.com;`
  );
  next();
});

// CORS
app.use(
  cors({
    origin: [
      env.APP_URL,
      'https://admin.shopify.com',
      /\.myshopify\.com$/,
      'http://localhost:5173',
    ],
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser(env.COOKIE_SECRET));

// Request logging 
app.use(requestLogger);

// Global rate limiting
app.use(globalRateLimiter);

// API routes
app.use('/api', router);

// Serve frontend build (production)
const frontendDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(frontendDist)) {
  // Serve static files from built frontend
  app.use(express.static(frontendDist));

  // SPA fallback — all non-API routes serve index.html
  app.get('/{path}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Dev mode — redirect / to Vite dev server
  app.get('/', (req, res) => {
    const shop = req.query.shop as string;
    const host = req.query.host as string;
    const params = new URLSearchParams();
    if (shop) params.set('shop', shop);
    if (host) params.set('host', host);
    res.redirect(`http://localhost:5173?${params.toString()}`);
  });
}

// 404 handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      error: {
        message: 'Route not found',
        statusCode: 404,
      },
    });
    return;
  }
  next();
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;