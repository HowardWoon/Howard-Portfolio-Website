# Howard Woon Hao Zhe Portfolio

Premium Next.js App Router portfolio with Tailwind CSS, Supabase-backed content, and a protected admin dashboard.

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in the Supabase values.
2. Run the SQL in `sql/001_init.sql` inside your Supabase project.
3. Install dependencies and start the app:

```bash
npm install
npm run dev
```

## Admin

- Public portfolio: `/`
- Login: `/admin/login`
- Dashboard: `/admin/dashboard`
