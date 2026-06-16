# APP_DECISIONS.md — Tactile Lab: Group Buy Manager

## Store Concept

**Tactile Lab** is a high-end mechanical keyboard and desk accessories store
targeting the enthusiast community. The store sells:

- Customizable keyboard bases (aluminum, polycarbonate, brass)
- Premium switches (linear, tactile, clicky, silent)
- Designer keycap sets
- Desk accessories (mousepads, cables, wrist rests)

### Why This Niche?
The mechanical keyboard community is one of the most active and passionate
hardware communities online. They have unique purchasing behaviors —
specifically "Group Buys" — that no off-the-shelf Shopify solution handles
well. This creates a genuine, unsolved merchant problem.

### Standout Theme Feature: Build Your Board Configurator
Users select a base keyboard, switch type, and keycap colorway. The product
image updates dynamically as selections change and the total price recalculates
in real time using line item properties. This mirrors how enthusiasts actually
think about keyboards — as modular systems, not fixed products.

---

## App Idea: Group Buy & Pre-Order Manager

### The Problem
Mechanical keyboard Group Buys work like this:
1. Designer announces a keyboard
2. Community "buys in" during a funding window (weeks/months)
3. Manufacturer produces the run (months/years)
4. Units ship to buyers

Shopify has no native concept for this. Merchants are left managing:
- Which GBs are in production vs shipping vs overdue
- How many customers are waiting for each GB
- Supplier communications and delay tracking
- Customer notification decisions (when is a delay bad enough to email?)

The Group Buy Manager solves all of this with a single dashboard that
ranks every active group buy by fulfillment urgency — so the merchant
always knows what to work on first.

### Key Features
- **Urgency Scoring** — 0–100 score computed from 3 weighted factors
- **Ranked Dashboard** — highest urgency always at the top
- **Auto Alerts** — system detects overdue GBs and delay patterns
- **Activity Log** — full audit trail of every status change
- **Manufacturing Pipeline** — track stages from tooling to shipping

---

## Key Architecture Decisions

### 1. Module-based folder structure (Routes → Controller → Service → Repository)
Each feature (auth, rules, scoring, activity, dashboard) is fully
self-contained. Controllers know Express. Services know business logic.
Repositories know Drizzle. Nothing else crosses these boundaries.

**Tradeoff:** More files per feature vs monolithic files.
**Why:** Makes each layer independently testable and replaceable.
If we swap MySQL for PostgreSQL, only repository files change.

### 2. Scoring as a separate module
The urgency scoring algorithm lives in its own module (`modules/scoring/`)
rather than inside the rules module.

**Why:** Scoring is a distinct business concern. It reads from rules,
writes to scores, and is triggered by multiple other modules. Keeping it
separate means the algorithm can evolve independently without touching
the CRUD logic for group buys.

### 3. Access + Refresh tokens in httpOnly cookies
Tokens are never exposed to JavaScript. The access token lives 15 minutes,
the refresh token lives 7 days. On every authenticated request, if the
access token is expired, the middleware silently refreshes it using the
refresh token — the user never sees a login screen.

**Tradeoff:** Slightly more complex middleware vs simpler localStorage approach.
**Why:** httpOnly cookies are immune to XSS attacks. For a Shopify app
that handles merchant data, this is the correct security posture.

### 4. Shopify access token encrypted at rest
The Shopify API access token stored in the `shops` table is AES-256
encrypted using the `ENCRYPTION_KEY` env variable. Even if the database
is compromised, tokens are unreadable without the key.

### 5. Rate limiting keyed by shop domain (not IP)
Standard IP-based rate limiting would penalize all merchants sharing the
same corporate NAT/proxy. Keying by shop domain means each merchant gets
their own independent rate limit bucket.

### 6. Activity logging as a side effect
The activity log is not a primary feature — it's a side effect. Every
service that mutates data calls `activityService.log()` as part of its
operation. This means the log is always accurate and requires no extra
developer discipline to maintain.

### 7. Schema naming follows the folder structure
Tables map directly to modules:
- `rules` → `modules/rules/`
- `scores` → `modules/scoring/`
- `products` → manufacturing stages (pipeline tracking)
- `activity_logs` → `modules/activity/`

This makes it immediately obvious which module owns which table.

---

## Urgency Scoring Algorithm

The urgency score (0–100) is computed from three weighted components:

| Component | Weight | Rationale |
|---|---|---|
| Days until ship date | 45% | Deadline proximity is the #1 driver of urgency |
| Delay penalty | 30% | Any supplier delay requires immediate merchant attention |
| Customer stake | 25% | More customers waiting = higher business impact |

### Score → Level mapping
| Score | Level | Action |
|---|---|---|
| 75–100 | 🚨 Critical | Immediate action required |
| 50–74 | ⚠️ High | Review today |
| 25–49 | 🔵 Medium | Monitor this week |
| 0–24 | ✅ Low | On track |

---

## Database Schema Decisions

### Why MySQL (not PostgreSQL)?
The tech stack specified MySQL. MySQL 8+ supports JSON columns, window
functions, and CTEs — everything needed for this app.

### Why UUIDs as primary keys (not auto-increment)?
UUIDs are safe to expose in URLs without leaking sequence information.
`/api/rules/1` tells competitors how many group buys you have.
`/api/rules/a3f2b1c4-...` does not.

### Why store Shopify access token in the `shops` table AND sessions table?
- `shops.accessToken` = the Shopify OAuth token (for API calls to Shopify)
- `sessions.accessToken` = the JWT for our own API (for calls to our backend)

These are different tokens for different purposes and must not be confused.

---

## Tradeoffs

| Decision | Benefit | Cost |
|---|---|---|
| TypeScript everywhere | Type safety, better DX | More boilerplate |
| Zod validation | Runtime type safety | Extra dependency |
| Module-per-feature | Clean separation | More files |
| httpOnly cookies | XSS protection | CSRF consideration needed |
| UUID PKs | Safe to expose | Slightly larger index size |
| In-memory nonce store | Simple | Lost on server restart (use Redis in prod) |

---

## What I'd Improve With More Time

### High Priority
1. **Redis for nonce/session store** — replace in-memory Map with Redis
   so OAuth state survives server restarts and horizontal scaling
2. **Shopify Webhook integration** — listen to `orders/paid` webhook to
   auto-increment `customerCount` when an order is placed for a GB product
3. **Email notifications** — when urgency score crosses critical threshold,
   auto-send merchant a summary email via SendGrid/Resend
4. **Supplier update thread** — structured supplier communication log
   with delay day tracking per update, not just a notes field

### Medium Priority
5. **Real Shopify product linking** — connect a group buy to an actual
   Shopify product via `shopifyProductId` and pull live order count
6. **CSV export** — export group buy list + urgency scores as CSV for
   external reporting
7. **Role-based access** — staff accounts with read-only vs full access
8. **Pagination UI** — the frontend currently loads all records;
   add proper cursor-based pagination for large catalogs

### Nice to Have
9. **Dark mode** — the theme is dark but the admin app uses Polaris light;
   a dark variant would match the brand better
10. **Mobile responsive admin** — currently optimized for desktop;
    Shopify admin is often accessed on mobile
11. **Test coverage** — unit tests for the scoring algorithm and
    integration tests for the OAuth flow
12. **Docker Compose** — containerize the full stack for one-command setup