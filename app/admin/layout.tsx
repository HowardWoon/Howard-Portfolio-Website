import Link from 'next/link';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-ink-950 text-white">
      <div className="section-shell py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.32em] text-white">
            HW.
          </Link>
          <Link href="/" className="text-sm text-fog-500 transition hover:text-white">
            Back to site
          </Link>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
