import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Download } from 'lucide-react';

const links = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#stack', label: 'Stack' },
  { href: '#leadership', label: 'Leadership' },
  { href: '#contact', label: 'Contact' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5">
      <div className="section-shell py-4">
        <div className="glass-nav flex items-center justify-between rounded-full px-4 py-3 sm:px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/howard.jpg"
              alt="Howard Woon"
              width={40}
              height={40}
              className="rounded-full object-cover"
              priority
            />
            <span className="hidden text-lg font-semibold tracking-tight text-white sm:inline">Howard</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-fog-500 md:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/resume"
              download
              className="hidden items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-white/90 transition hover:border-white/30 hover:bg-white/[0.05] sm:inline-flex"
            >
              <span>Download Resume</span>
              <Download className="h-4 w-4" />
            </a>
            <a
              href="/resume"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] md:hidden"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
