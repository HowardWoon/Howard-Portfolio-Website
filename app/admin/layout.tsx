import Link from 'next/link';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-ink-950 text-white">
      <div className="section-shell py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.32em] text-white">
            HW.
          </Link>
          <div className="flex items-center gap-4 text-sm text-fog-500">
            <Link href="/admin/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/messages" className="transition hover:text-white">
              Inbox
            </Link>
            <Link href="/" className="transition hover:text-white">
              Back to site
            </Link>
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
