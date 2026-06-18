# Tactile Lab - App Decisions

This file explains the idea behind the store, the embedded app, and the main technical choices.

## 1. Store Concept

The fictional store is called **Tactile Lab**.

Tactile Lab sells premium mechanical keyboard products:

- Custom keyboard kits.
- Keyboard switches.
- Keycap sets.
- Desk accessories.

The store is made for keyboard enthusiasts who care about sound, feel, design, and custom builds.

## 2. Why This Store Idea?

Mechanical keyboard stores often use **group buys**.

A group buy is a pre-order campaign where customers pay before the product is manufactured.

This creates real merchant problems:

- Some products are still funding.
- Some are in production.
- Some are delayed.
- Some have many customers waiting.
- Merchants need to decide when to contact suppliers or customers.

That makes this store idea a good fit for both a creative storefront and a useful admin app.

## 3. Theme Standout Feature

The main storefront feature is the **Build Your Board Configurator**.

On products tagged `configurator`, shoppers can choose:

1. Keyboard base.
2. Switch type.
3. Keycap style.

The page updates the price and saves the choices in the cart as line item properties.

There is also a product recommender quiz that asks about typing style and suggests products.

## 4. Embedded App Idea

The embedded app is called **Group Buy Manager**.

It helps the merchant manage group buys from inside Shopify Admin.

The app answers this question:

```text
Which group buy needs attention first?
```

Main features:

- Dashboard with store-level group buy stats.
- Create and update group buys.
- Track production stage.
- Track customer count and funding.
- Track delay days.
- Rank group buys by urgency.
- Save score history.
- Save activity logs.

## 5. Main Architecture Choice

The backend uses a module-based structure.

Each feature has its own folder:

- `auth`
- `shops`
- `rules`
- `scoring`
- `activity`
- `dashboard`

Each module can have:

- Routes.
- Controller.
- Service.
- Repository.

Simple explanation:

| Layer | Job |
| --- | --- |
| Route | Defines the API URL. |
| Controller | Reads request input and returns response output. |
| Service | Holds business logic. |
| Repository | Talks to the database with Drizzle. |

This keeps the code easier to understand and easier to change.

## 6. Database Decisions

The app uses MySQL with Drizzle ORM.

Main tables:

| Table | Purpose |
| --- | --- |
| `shops` | Stores installed Shopify shops. |
| `sessions` | Stores app session tokens. |
| `rules` | Stores group buys. |
| `products` | Stores production stages for group buys. |
| `scores` | Stores urgency score history. |
| `activity_logs` | Stores activity history. |

Important naming note:

The `rules` table stores group buys. The `products` table stores production stages. These names are historical, but the app documents what they mean.

## 7. OAuth And Security Decisions

The app uses Shopify OAuth.

After install:

1. Shopify gives the backend an access token.
2. The backend saves the Shopify token in the database.
3. The backend creates app session cookies.
4. The merchant uses the embedded app through those cookies.

Security choices:

- Shopify access tokens are encrypted before saving to MySQL.
- App tokens are stored in `httpOnly` cookies.
- Cookies are `secure` and `sameSite=none` for Shopify iframe support.
- The app uses access and refresh tokens.

This is safer than storing tokens in browser local storage.

## 8. Urgency Scoring Decision

The app includes a logic-based feature: **urgency scoring**.

Each group buy gets a score from 0 to 100.

The score uses:

| Factor | Weight | Why |
| --- | ---: | --- |
| Days until ship date | 45% | Close or overdue ship dates need attention. |
| Delay days | 30% | Supplier delays increase risk. |
| Customer count | 25% | More waiting customers means higher impact. |

Score levels:

| Score | Level | Meaning |
| ---: | --- | --- |
| 75 to 100 | Critical | Act now. |
| 50 to 74 | High | Review today. |
| 25 to 49 | Medium | Watch closely. |
| 0 to 24 | Low | On track. |

This makes the dashboard useful, not just a list of records.

## 9. Tradeoffs

| Choice | Benefit | Tradeoff |
| --- | --- | --- |
| TypeScript | Safer code and better editor help. | More setup and types. |
| Module-based backend | Easier to read and maintain. | More files. |
| Drizzle ORM | Clear schema and SQL-friendly queries. | Requires migration setup. |
| MySQL | Matches the required stack. | Less flexible than PostgreSQL for some advanced features. |
| `httpOnly` cookies | Better security. | Requires HTTPS and iframe-friendly cookie settings. |
| In-memory OAuth nonce store | Simple for take-home project. | Use Redis in production. |
| Manual activity logging | Easy to understand. | More automation would be better later. |

## 10. What I Would Improve With More Time

High priority:

1. Add real automated tests for scoring, auth, and rules.
2. Add Shopify webhooks for orders and app uninstall.
3. Auto-update customer counts from real Shopify orders.
4. Add email alerts when a group buy becomes critical.
5. Replace the in-memory OAuth nonce store with Redis.

Medium priority:

1. Improve pagination and filtering for large stores.
2. Add CSV export for group buy reports.
3. Add staff permissions.
4. Add a structured supplier update thread.
5. Add Docker Compose for easier setup.

Nice to have:

1. Better mobile admin layout.
2. Dark mode for the admin app.
3. More storefront animations.
4. More polished sample product data.
