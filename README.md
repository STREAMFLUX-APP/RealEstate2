# Streamflux — Complete Setup Guide

-----

## STEP 1 — Create your Supabase database (free, 5 minutes)

1. Go to **supabase.com** → Sign up free
1. Create a new project (name it: streamflux)
1. Go to **SQL Editor** and run this to create your users table:

```sql
CREATE TABLE users (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
plan TEXT NOT NULL,
trial_ends_at TIMESTAMP NOT NULL,
subscribed BOOLEAN DEFAULT false,
active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT now()
);
```

1. Go to **Settings → API** and copy:
- **Project URL** → this is your SUPABASE_URL
- **service_role key** → this is your SUPABASE_SERVICE_KEY

-----

## STEP 2 — Upload to GitHub

1. Go to **github.com** → Create new repository
1. Name it: `streamflux-app`
1. Upload ALL files keeping this exact structure:

```
vercel.json
api/auth.js
api/claude.js
api/admin.js
public/index.html
README.md
```
1. Click **Commit changes**

-----

## STEP 3 — Deploy on Vercel

1. Go to **vercel.com** → New Project
1. Import your `streamflux-app` GitHub repository
1. Click **Deploy**

-----

## STEP 4 — Add your secret keys (CRITICAL)

In Vercel → Your Project → **Settings → Environment Variables**, add these 4:

|Name |Value |
|----------------------|-----------------------------------------------------|
|`ANTHROPIC_API_KEY` |Your Claude API key from console.anthropic.com |
|`SUPABASE_URL` |Your Supabase project URL |
|`SUPABASE_SERVICE_KEY`|Your Supabase service_role key |
|`ADMIN_SECRET_KEY` |Make up a strong password e.g. `StreamfluxAdmin2026!`|

After adding all 4 → click **Redeploy**

-----

## STEP 5 — Add your first client

1. Open your live app URL
1. Log in with **francisco@streamflux.app** (add yourself first via the admin panel)
1. Click **⚙️ Admin** in the top right
1. Enter your Admin Secret Key
1. Fill in the client’s name, email, password, plan and trial days
1. Click **Add Client**
1. Email the client their login URL, email and password

-----

## PLANS

- `marketing` = App 1 only (Property Marketing Machine) — $125/mo
- `outreach` = App 2 only (Client Outreach Machine) — $125/mo
- `bundle` = Both Apps — $157/mo

-----

## HOW TO MANAGE CLIENTS

In the Admin Panel you can:

- **Add Client** — enter name, email, password, plan, trial days
- **Mark Paid** — when they pay on Stripe, click this to give full access
- **Deactivate** — if they cancel, click this. They can no longer log in.
- **Activate** — re-activate if they come back

-----

## TRIAL SYSTEM

- Default trial = 7 days
- After trial ends, client sees a message to subscribe
- When they pay on Stripe, go to Admin Panel and click **Mark Paid**
- They get unlimited access until you deactivate them

-----

Built by Streamflux · streamflux.app · francisco@streamflux.app
