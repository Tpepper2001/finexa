# Finexa — Finance, Engineered for What's Next

A full-stack financial management platform for Nigerian businesses. Built with React + Supabase.

## Features

- **Invoicing** — Create, send, and track invoices with realtime status updates
- **Payroll** — Manage employees and process monthly payroll runs with PAYE/pension deductions
- **Receipts** — Upload and organize expense receipts via Supabase Storage
- **Teller Console** — Record cash-in / cash-out entries with a numpad UI
- **Dashboard** — Live stats and transaction history with Supabase Realtime

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, inline styles     |
| Backend   | Supabase (Postgres + Auth + Storage + Realtime) |
| Functions | Supabase Edge Functions (Deno)    |
| Email     | Resend                            |
| Payments  | Paystack webhooks                 |
| Deploy    | Vercel (frontend) + Supabase cloud |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/finexa.git
cd finexa
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your URL and anon key
3. Copy the env file and fill in your credentials:

```bash
cp .env.example .env.local
# edit .env.local with your values
```

### 3. Run database migrations

In your Supabase dashboard → **SQL Editor**, run each file in `supabase/migrations/` in order:

```
00002_users_profiles.sql
00003_invoices.sql
00004_payroll.sql
00005_receipts.sql
00006_transactions.sql
00007_teller.sql
00008_rls_policies.sql
```

Or using the Supabase CLI:

```bash
npx supabase db push
```

### 4. Create Storage bucket

In Supabase dashboard → **Storage**, create a bucket named `receipts`.
Set it to **public** if you want direct file URLs, or keep private and use signed URLs.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

| Variable                  | Description                      |
|---------------------------|----------------------------------|
| `VITE_SUPABASE_URL`       | Your Supabase project URL        |
| `VITE_SUPABASE_ANON_KEY`  | Your Supabase anon/public key    |

For Edge Functions, set in Supabase dashboard → **Edge Functions → Secrets**:

| Secret                        | Description                  |
|-------------------------------|------------------------------|
| `RESEND_API_KEY`              | Resend email API key         |
| `PAYSTACK_SECRET_KEY`         | Paystack secret key          |
| `SUPABASE_SERVICE_ROLE_KEY`   | Supabase service role key    |

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Set up GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Project Structure

```
finexa/
├── src/
│   ├── App.jsx               # Root app — auth, routing, all pages (inline styles)
│   ├── main.jsx              # ReactDOM entry point
│   ├── lib/                  # Supabase client, formatters, constants
│   ├── hooks/                # Custom hooks (useInvoices, usePayroll, etc.)
│   ├── pages/                # Page-level components (extend App.jsx pages here)
│   └── components/           # Reusable UI components
├── supabase/
│   ├── config.toml           # Local dev config
│   ├── seed.sql              # Demo data
│   └── migrations/           # All DB schema migrations
└── supabase-edge-functions/  # Serverless functions (email, payments, payroll)
```

---

## License

MIT
