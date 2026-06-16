import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  // Server
  PORT: parseInt(optionalEnv('PORT', '3000')),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  IS_DEV: optionalEnv('NODE_ENV', 'development') === 'development',

  // Shopify
  SHOPIFY_API_KEY: requireEnv('SHOPIFY_API_KEY'),
  SHOPIFY_API_SECRET: requireEnv('SHOPIFY_API_SECRET'),
  SHOPIFY_STORE_DOMAIN: requireEnv('SHOPIFY_STORE_DOMAIN'),
  SHOPIFY_SCOPES: requireEnv('SHOPIFY_SCOPES'),
  APP_URL: requireEnv('APP_URL'),
  REDIRECT_URI: requireEnv('REDIRECT_URI'),

  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),
  DB_HOST: requireEnv('DB_HOST'),
  DB_PORT: parseInt(optionalEnv('DB_PORT', '3306')),
  DB_USER: requireEnv('DB_USER'),
  DB_PASSWORD: optionalEnv('DB_PASSWORD', ''),
  DB_NAME: requireEnv('DB_NAME'),

  // Auth
  JWT_SECRET: requireEnv('JWT_SECRET'), 
  JWT_ACCESS_EXPIRES_IN: optionalEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  COOKIE_SECRET: requireEnv('COOKIE_SECRET'),
  ENCRYPTION_KEY: requireEnv('ENCRYPTION_KEY'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '60000')),
  RATE_LIMIT_MAX_REQUESTS: parseInt(optionalEnv('RATE_LIMIT_MAX_REQUESTS', '100')),
} as const;

export type Env = typeof env;