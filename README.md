# Soulmate Cafe & Celebration House — Customer Loyalty System

A staff-facing loyalty & rewards app for the cafe. Built with Next.js
(App Router), Tailwind CSS, shadcn/ui, and Supabase (Postgres + Auth).
Customers never log in — staff handle everything from the counter, fast.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui** (warm cafe palette — cream / charcoal / amber-terracotta)
- **Supabase** — Postgres database, Auth (email/password), Row Level Security
- Deploy target: **Vercel**

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   every table, view, RPC function, RLS policy, and a starter set of rewards.
3. Create your first Owner login:
   - **Authentication → Users → Add user** — enter your email + a password,
     check *Auto Confirm User*.
   - Back in **SQL Editor**, run (swap in that email):
     ```sql
     update public.profiles set role = 'owner'
     where id = (select id from auth.users where email = 'you@example.com');
     ```
   - Every account created afterwards can be done from the app's
     **Manage Staff** page (Owner-only) — no more manual SQL needed.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your project's
**Project Settings → API Keys** values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # safe, public by design
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # secret — server-only, never commit
```

The service_role key is only used server-side (`src/lib/supabase/admin.ts`)
for one privileged action: creating staff logins from the Manage Staff page.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → redirects to `/login` → sign in with the
Owner account you created above.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Import Project** → select the repo.
3. Add the same three environment variables from `.env.local` in
   **Project Settings → Environment Variables**.
4. Deploy. That's it — no other config needed.

## How points work

- **Earning**: 1 point per $10 spent, rounded down (`floor(amount / 10)`),
  credited the instant a visit is recorded — see `record_visit()` in
  `supabase/schema.sql`.
- **Redeeming**: staff pick a customer and a reward on the **Rewards** page;
  `redeem_reward()` validates the balance, deducts points, and logs the
  redemption atomically — a balance can never go negative or drift from a
  half-finished request.
- All point math lives in Postgres functions, not app code, so it can't be
  bypassed or double-submitted from the client.

## Project structure

```
src/app/
  login/                 Staff sign-in (no customer accounts exist)
  (app)/                 Authenticated shell (sidebar/topbar + auth check)
    dashboard/           Stats, top 5 loyal customers, 7-day visit chart
    customers/           Searchable list, add/edit, profile w/ full history
    visits/new/          Quick-entry: search customer → amount → done
    rewards/             Redeem catalog + Owner-only reward management
    staff/               Owner-only: create/view staff logins & roles
src/lib/supabase/         Browser/server/admin Supabase clients + DB types
supabase/schema.sql       Full schema: tables, views, RPCs, RLS policies
```

## Roles

- **Staff**: everything needed at the counter — add customers, record visits,
  redeem rewards. No confirmation dialogs slow this down.
- **Owner**: everything Staff can do, plus deleting customers, managing the
  rewards catalog, and creating new staff logins.
