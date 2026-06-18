# Tactile Lab - Step-by-Step Setup Guide

This guide explains how to run the whole project in simple steps.

The project has two main parts:

1. `theme/` - the Shopify storefront theme.
2. `app/` - the embedded Shopify admin app.

The admin app also has two parts:

1. `app/client` - the Vite + React frontend.
2. `app/server` - the Node.js + Express backend.

## Step 1 - Install Required Tools

Install these before starting:

- Node.js 20 or newer.
- npm.
- MySQL 8 or XAMPP with MySQL.
- Shopify Partner account.
- Shopify development store.
- Shopify CLI.
- A tunnel tool, such as Cloudflare Tunnel or ngrok.

Install Shopify CLI:

```powershell
npm install -g @shopify/cli @shopify/theme
```

## Step 2 - Install Project Dependencies

Open a terminal in the project root.

Install backend dependencies:

```powershell
cd app\server
npm install
```

Install frontend dependencies:

```powershell
cd ..\client
npm install --legacy-peer-deps
```

Why `--legacy-peer-deps`?

The frontend uses React 18 with newer type packages. This option avoids npm peer dependency conflicts.

## Step 3 - Create The Environment File

The backend reads `.env` from the project root.

From the project root, copy the example file:

```powershell
Copy-Item .env.example .env
```

Then open `.env` and fill in the values.

Basic example:

```env
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_STORE_DOMAIN=
SHOPIFY_SCOPES=read_products,write_products,read_orders,read_customers
APP_URL=
REDIRECT_URI=
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tactile_lab
DATABASE_URL=mysql://root:@localhost:3306/tactile_lab

JWT_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=
ENCRYPTION_KEY=

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

What each important value means:

| Value | Meaning |
| --- | --- |
| `SHOPIFY_API_KEY` | Your Shopify app client ID. |
| `SHOPIFY_API_SECRET` | Your Shopify app client secret. |
| `SHOPIFY_STORE_DOMAIN` | Your store domain, like `my-store.myshopify.com`. |
| `APP_URL` | The HTTPS tunnel URL for the backend. |
| `REDIRECT_URI` | The tunnel URL plus `/api/auth/callback`. |
| `DATABASE_URL` | MySQL connection string used by Drizzle. |
| `JWT_SECRET` | Secret used to sign app login tokens. |
| `COOKIE_SECRET` | Secret used by cookie middleware. |
| `ENCRYPTION_KEY` | Exactly 32 characters. Used to encrypt tokens in the database. |

Generate secrets with these commands:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Use:

1. First output for `JWT_SECRET`.
2. Second output for `COOKIE_SECRET`.
3. Third output for `ENCRYPTION_KEY`.

The third output is exactly 32 characters.

## Step 4 - Create The MySQL Database

Start MySQL first.

If you use XAMPP:

1. Open XAMPP Control Panel.
2. Start MySQL.
3. Open phpMyAdmin or MySQL shell.
4. Create the database:

```sql
CREATE DATABASE tactile_lab;
```

If you use Docker:

```powershell
docker run --name tactile-lab-db `
  -e MYSQL_ROOT_PASSWORD=devpass `
  -e MYSQL_DATABASE=tactile_lab `
  -p 3306:3306 `
  -d mysql:8
```

For the Docker example, use this in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=devpass
DB_NAME=tactile_lab
DATABASE_URL=mysql://root:devpass@localhost:3306/tactile_lab
```

## Step 5 - Run Database Migrations

Go to the backend folder:

```powershell
cd app\server
```

Run migrations:

```powershell
npm run db:migrate
```

This creates the database tables.

Main tables:

- `shops`
- `sessions`
- `rules`
- `products`
- `scores`
- `activity_logs`

## Step 6 - Add Sample Data

Still inside `app/server`, run:

```powershell
npm run db:seed
```

This adds sample data for:

- A sample shop.
- Sample group buys.
- Production stages.
- Urgency scores.
- Activity logs.

This is useful for testing the dashboard before connecting a real Shopify store.

## Step 7 - Start The Backend Server

In one terminal:

```powershell
cd app\server
npm run dev
```

The backend runs at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

If this works, the API is running.

## Step 8 - Start The Frontend Server

Open another terminal:

```powershell
cd app\client
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The frontend sends API requests to `/api`.

In development, Vite forwards `/api` requests to:

```text
http://localhost:3000
```

## Step 9 - Start An HTTPS Tunnel

Shopify embedded apps need HTTPS.

The app also uses secure cookies, so the full OAuth flow needs HTTPS.

Start a tunnel to the backend:

```powershell
cloudflared tunnel --url http://localhost:3000
```

Copy the HTTPS URL. It will look like this:

```text
https://example.trycloudflare.com
```

Update `.env`:

```env
APP_URL=https://example.trycloudflare.com
REDIRECT_URI=https://example.trycloudflare.com/api/auth/callback
```

Restart the backend after changing `.env`.

## Step 10 - Update Shopify App Settings

Go to your Shopify Partner dashboard.

Open your app settings and set:

| Shopify setting | Value |
| --- | --- |
| App URL | Your tunnel URL |
| Allowed redirection URL | Your tunnel URL plus `/api/auth/callback` |

Example:

```text
App URL:
https://example.trycloudflare.com

Allowed redirection URL:
https://example.trycloudflare.com/api/auth/callback
```

## Step 11 - Install The App On A Dev Store

Open this URL in your browser:

```text
https://example.trycloudflare.com/api/auth/install?shop=YOUR-STORE.myshopify.com
```

Replace `YOUR-STORE.myshopify.com` with your real dev store domain.

Expected result:

1. You are sent to Shopify.
2. You approve the app.
3. Shopify sends you back to the backend.
4. The backend saves the shop and session.
5. You are redirected into Shopify Admin.
6. The embedded app loads.

## Step 12 - Run The Shopify Theme

The theme is inside:

```text
theme/
```

Preview the theme:

```powershell
shopify theme dev --store=YOUR-STORE.myshopify.com --path=theme
```

Push the theme:

```powershell
shopify theme push --store=YOUR-STORE.myshopify.com --path=theme
```

## Step 13 - Add Store Content For Testing

In Shopify Admin, create products and collections.

Recommended tags:

| Tag | Why it matters |
| --- | --- |
| `configurator` | Shows the Build Your Board feature on the product page. |
| `group-buy` | Helps show group-buy products. |
| `new` | Used for filtering and merchandising. |
| `linear` | Useful for keyboard switch products. |
| `tactile` | Useful for keyboard switch products. |
| `clicky` | Useful for keyboard switch products. |

Recommended collections:

- A featured products collection.
- A group buys collection.

## Step 14 - Optional: Sync Products To Shopify

The backend includes a script that can create sample Tactile Lab products in Shopify.

Only run this on a development store.

It may delete default demo products like snowboard products.

From `app/server`:

```powershell
npx ts-node src\db\syncProducts.ts
```

Before running it:

1. Install the app on the dev store.
2. Make sure the app has product read/write scopes.
3. Make sure the `shops` table has a real Shopify token.

## Step 15 - Build The Project

Build the backend:

```powershell
cd app\server
npm run build
```

Build the frontend:

```powershell
cd app\client
npm run build
```

Start the built backend:

```powershell
cd app\server
npm start
```

If `app/client/dist` exists, the backend can serve the built frontend.

## Step 16 - Check That Everything Works

Check the backend:

```text
http://localhost:3000/api/health
```

Check the admin app:

- Dashboard loads.
- Group buys page loads.
- You can create a group buy.
- You can edit a group buy.
- Urgency score is calculated.
- Activity page shows logs.
- Settings page shows shop data.

Check the storefront:

- Home page loads.
- Collection page loads.
- Product page loads.
- Cart page loads.
- Product tagged `configurator` shows the Build Your Board feature.
- Add to cart works.
- Cart drawer opens.
- Configurator choices appear as line item properties.

## Step 17 - Troubleshooting

### Problem: Server says an environment variable is missing

Check that:

- `.env` exists in the project root.
- The value is not empty.
- The backend was restarted after editing `.env`.

### Problem: Database connection failed

Check that:

- MySQL is running.
- The database `tactile_lab` exists.
- `DB_USER` and `DB_PASSWORD` are correct.
- `DATABASE_URL` matches the same database.

### Problem: OAuth does not work

Check that:

- The tunnel is running.
- `APP_URL` uses the current tunnel URL.
- `REDIRECT_URI` is correct.
- Shopify Partner settings use the same redirect URL.
- You restarted the backend after changing `.env`.

### Problem: App loads but API returns 401

Check that:

- You installed the app through `/api/auth/install`.
- You are using HTTPS through the tunnel.
- Your browser allows cookies for the Shopify embedded app.

### Problem: Frontend cannot reach backend

Check that:

- Backend is running on port `3000`.
- Frontend is running on port `5173`.
- Vite proxy is still set to `http://localhost:3000`.

## Step 18 - Current Testing Notes

There is no active `npm test` script yet.

The current automated checks are:

```powershell
cd app\server
npm run build
```

```powershell
cd app\client
npm run build
```

Manual Shopify testing is still needed for:

- OAuth install.
- Embedded app loading.
- Theme preview.
- Cart behavior.
