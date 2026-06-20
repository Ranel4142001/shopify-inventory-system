# Tactile Lab — Shopify Fullstack Challenge

A custom Shopify theme + embedded admin app for a mechanical keyboard store.

## Project Structure
shopify-store-tactile-lab/

├── theme/          # Part 1 — Shopify Liquid theme

├── app/

│   ├── client/    # Part 2 — Vite + React frontend

│   └── server/    # Part 2 — Node.js + Express backend

└── docs/          # Architecture docs + ERD

## Tech Stack

| Layer | Technology |
|---|---|
| Theme | Shopify Liquid + CSS + Vanilla JS |
| Frontend | Vite + React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL + Drizzle ORM |
| Auth | Shopify OAuth + JWT (httpOnly cookies) |

---

## Part 1: Theme Setup

### Prerequisites
- Shopify Partner account
- Development store created
- Shopify CLI installed

### Install Shopify CLI
```bash
npm install -g @shopify/cli @shopify/theme
```

### Push theme to dev store
```bash
cd shopify-store-tactile-lab
shopify theme push --store=tactile-lab.myshopify.com --path=theme
```

### Preview theme locally
```bash
shopify theme dev --store=tactile-lab.myshopify.com --path=theme
```

### Add sample products
In your Shopify admin:
1. Create a product tagged `configurator` to enable the Build Your Board feature
2. Create a collection for the Featured Collection section
3. Add products tagged `group-buy`, `new`, `linear`, `tactile`, `clicky`

---

## Part 2: App Setup

### Prerequisites
- Node.js 18+
- MySQL 8+ (or XAMPP)
- Shopify Partner account + dev store + app created

### 1. Database Setup

Start MySQL (XAMPP or local):
```bash
# XAMPP: Open control panel → Start MySQL
# Or Docker:
docker run --name tactile-lab-db \
  -e MYSQL_ROOT_PASSWORD=devpass \
  -e MYSQL_DATABASE=tactile_lab \
  -p 3306:3306 -d mysql:8
```

Create the database:
```sql
CREATE DATABASE tactile_lab;
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:
```bash
cp .env.example .env
```

Required values:
```env
SHOPIFY_API_KEY=          # From Partner dashboard → App → Client ID
SHOPIFY_API_SECRET=       # From Partner dashboard → App → Client Secret
SHOPIFY_STORE_DOMAIN=     # e.g. tactile-lab.myshopify.com
SHOPIFY_SCOPES=read_products,write_products,read_orders,read_customers
APP_URL=                  # Your tunnel URL (e.g. https://xxxx.trycloudflare.com)
REDIRECT_URI=             # APP_URL + /api/auth/callback
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=              # Empty for XAMPP default
DB_NAME=tactile_lab
DATABASE_URL=mysql://root:@localhost:3306/tactile_lab
JWT_SECRET=               # Random 32+ char string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=            # Random 32+ char string
ENCRYPTION_KEY=           # Exactly 32 characters
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate secrets:
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY (must be exactly 32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 3. Backend Setup

```bash
cd app/server
npm install

# Generate migrations
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Start dev server
npm run dev
```

Server starts at: `http://localhost:3000`
Health check: `http://localhost:3000/api/health`

### 4. Frontend Setup

```bash
cd app/client
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

Frontend starts at: `http://localhost:5173`

### 5. Tunnel Setup (required for OAuth)

Shopify requires HTTPS for embedded apps. Use Cloudflare tunnel:

```bash
# Install
npm install -g cloudflared

# Start tunnel (run in separate terminal)
cloudflared tunnel --url http://localhost:3000
```

Copy the HTTPS URL (e.g. `https://xxxx.trycloudflare.com`) and:
1. Update `APP_URL` in `.env`
2. Update `REDIRECT_URI` in `.env` to `https://xxxx.trycloudflare.com/api/auth/callback`
3. Update App URL in Shopify Partner dashboard → App → Versions
4. Update Redirect URL in Shopify Partner dashboard → App → Versions
5. Restart the backend server

### 6. Install App on Dev Store

Visit in your browser: https://xxxx.trycloudflare.com/api/auth/install?shop=tactile-lab.myshopify.com

This triggers the OAuth flow. After approval you'll be redirected to the app.

---

## API Endpoints

### Auth

GET  /api/auth/install    OAuth install start
GET  /api/auth/callback   OAuth callback
POST /api/auth/refresh    Refresh tokens
POST /api/auth/logout     Logout


### Dashboard

GET  /api/dashboard         Full dashboard data
GET  /api/dashboard/summary Summary cards only


### Group Buys (Rules)

GET    /api/rules           List all (paginated)
GET    /api/rules/:id       Get single with details
POST   /api/rules           Create new
PUT    /api/rules/:id       Update
DELETE /api/rules/:id       Delete


### Scoring

GET  /api/scoring/ranked          All GBs ranked by urgency
POST /api/scoring/:id/score       Score a specific GB
GET  /api/scoring/:id/history     Score history

### Activity

GET /api/activity                        Shop activity log
GET /api/activity/recent                 Last N activities
GET /api/activity/group-buy/:id          GB-specific log

### Shops

GET    /api/shops/me       Current shop info
DELETE /api/shops/uninstall Uninstall app


---

## Running Everything Together

Open 4 terminals:

```bash
# Terminal 1 — MySQL (XAMPP or Docker)
# Start MySQL from XAMPP control panel

# Terminal 2 — Tunnel
cloudflared tunnel --url http://localhost:3000

# Terminal 3 — Backend
cd app/server && npm run dev

# Terminal 4 — Frontend
cd app/client && npm run dev
```

Then visit: `http://localhost:5173`

---

## Theme Pages

| Page | URL | Section Used |
|---|---|---|
| Home | `/` | hero-banner, featured-collection, product-recommender |
| Collection | `/collections/all` | main-collection |
| Product | `/products/:handle` | main-product (+ configurator if tagged) |
| Cart | `/cart` | main-cart |

---

## Standout Features

### Theme: Build Your Board Configurator
Tag any product with `configurator` to enable the interactive builder.
Users select base + switches + keycaps and see:
- Live price calculation
- Dynamic image swap per selection
- Build summary before checkout
- Selections saved as line item properties

### App: Urgency Scoring Algorithm
Every group buy gets a 0–100 urgency score based on:
- **45%** Days until target ship date
- **30%** Supplier delay days
- **25%** Number of customers waiting

The dashboard always shows the highest urgency group buy first.
Auto-alerts fire when a group buy is overdue or significantly delayed.  