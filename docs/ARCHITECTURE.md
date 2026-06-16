# Architecture Overview — Tactile Lab

## System Diagram

Browser (Shopify Admin)

│

▼

┌─────────────────────┐

│  Vite + React App   │  ← app/client/  (port 5173 in dev)

│  - Dashboard        │

│  - Group Buys CRUD  │

│  - Activity Log     │

│  - Settings         │

└────────┬────────────┘

│ HTTP (proxied to :3000)

▼

┌─────────────────────┐

│  Express API Server │  ← app/server/  (port 3000)

│                     │

│  Middleware Stack:  │

│  → rateLimiter      │

│  → requestLogger    │

│  → cookieParser     │

│  → requireAuth      │

│                     │

│  Modules:           │

│  → auth/            │

│  → shops/           │

│  → rules/           │

│  → scoring/         │

│  → activity/        │

│  → dashboard/       │

└────────┬────────────┘

│ Drizzle ORM

▼

┌─────────────────────┐

│  MySQL Database     │  (port 3306)

│                     │

│  Tables:            │

│  → shops            │

│  → sessions         │

│  → rules            │

│  → products         │

│  → scores           │

│  → activity_logs    │

└─────────────────────┘

▲

│ Shopify Admin API

┌─────────────────────┐

│  Shopify Platform   │

│  → OAuth tokens     │

│  → Product data     │

│  → Order data       │

└─────────────────────┘


## Request Lifecycle 

Browser sends request with cookies
Express receives request
globalRateLimiter checks shop domain bucket
requestLogger records method + URL
cookieParser extracts access + refresh tokens
requireAuth middleware:

a. Verifies access token (JWT)

b. If expired → uses refresh token to issue new pair

c. Attaches shopId/shop/sessionId to req
Route handler calls controller
Controller validates input (Zod)
Controller calls service
Service contains business logic
Service calls repository
Repository runs Drizzle query
Result flows back up the chain
Controller sends JSON response
