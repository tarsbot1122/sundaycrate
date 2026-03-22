# SundayCrate

A marketplace where therapists and counselors sell digital products — worksheets, templates, toolkits, and more — to mental health professionals everywhere.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe Connect (85/15 split)
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project ([supabase.com](https://supabase.com))
- Stripe account ([stripe.com](https://stripe.com))

### Setup

1. **Clone and install:**

   ```bash
   git clone <repo-url>
   cd sundaycrate
   npm install
   ```

2. **Environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase and Stripe credentials.

3. **Database:**

   Run `supabase/schema.sql` in your Supabase SQL editor to create all tables, RLS policies, and seed categories.

4. **Supabase Storage:**

   Create two buckets in your Supabase dashboard:
   - `products` (private) — for downloadable product files
   - `previews` (public) — for product preview images

5. **Stripe Webhooks:**

   For local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   For production, add a webhook endpoint in your Stripe dashboard pointing to:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```

   Events to listen for:
   - `checkout.session.completed`
   - `account.updated`

6. **Run the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (auth)/          Login & signup pages
  (marketing)/     Public pages (home, browse, product detail)
  (dashboard)/
    seller/        Seller dashboard, product management
    buyer/         Buyer dashboard, order history
    admin/         Admin moderation panel
  api/
    auth/          OAuth callback
    checkout/      Stripe Checkout session creation
    webhooks/      Stripe webhook handler
    seller/        Seller Stripe Connect onboarding
components/        Shared UI components
lib/               Utilities, Supabase clients, Stripe config
types/             TypeScript type definitions
supabase/          Database schema
```

## Marketplace Model

- **Sellers** upload digital therapy resources (worksheets, templates, toolkits)
- **Buyers** purchase and download resources
- **Commission:** 15% platform fee, sellers keep 85%
- **Payments:** Stripe Connect Express accounts for seller payouts

## Categories

1. CBT Worksheets
2. DBT Worksheets
3. Intake & Assessment Forms
4. Couples & Relationship
5. Anxiety & Stress Management
6. EMDR Resources
7. Trauma & PTSD
8. Practice Management
9. Art Therapy
10. IFS (Internal Family Systems)
11. Somatic Therapy
12. Therapy Posters & Office Decor
