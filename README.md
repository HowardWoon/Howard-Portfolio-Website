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
- Inbox: `/admin/messages`

## Vercel Environment Variables

Set these in the Vercel project settings for Production, Preview, and Development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER_UUID`

Use this exact admin UUID:

- `54c734ee-1e79-4e92-bf9b-8504a1854a31`

Optional but recommended:

- `NEXT_PUBLIC_SITE_URL` if you later add absolute links or redirects.

## Supabase Dashboard Checklist

1. Create or open your Supabase project.
2. Go to the SQL Editor and run `sql/001_init.sql`.
3. Confirm the tables exist: `profiles`, `experiences`, `projects`, `skills`, and `contact_messages`.
4. Confirm RLS is enabled on every table.
5. Create or identify the admin user in Supabase Auth.
6. Copy that user’s `auth.uid()` into `ADMIN_USER_UUID`.
7. If you want the role-based path too, set the admin user’s JWT metadata to include `app_metadata.role = admin`.
8. Insert or verify the seed content from the migration so the public site shows Howard’s latest profile, projects, skills, and experience.

## Notes

- Public users can only read the portfolio content.
- Admin writes are routed through server endpoints and revalidate the public page immediately.
- Contact form submissions are stored in Supabase and can be reviewed in `/admin/messages`.
