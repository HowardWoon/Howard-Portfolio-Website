import Image from 'next/image';
import Link from 'next/link';
import { Download } from 'lucide-react';

const links = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#stack', label: 'Stack' },
  { href: '#contact', label: 'Contact' }
];

export function SiteHeader() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto w-[90%] max-w-3xl">
      <div className="glass-panel py-2 px-4 rounded-full border border-white/10 bg-black/60 backdrop-blur-md shadow-glass flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/howard-solid.jpeg"
            alt="Howard Woon"
            width={32}
            height={32}
            className="rounded-full object-cover border border-white/20"
            priority
          />
          <span className="hidden text-xs font-jetbrains font-bold uppercase tracking-widest text-white sm:inline">Howard Woon</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-[10px] font-inter font-bold uppercase tracking-widest text-muted hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="/resume"
          download
          className="items-center gap-2 px-3 py-1.5 text-[10px] font-jetbrains font-bold uppercase text-white bg-primary rounded-full hover:bg-primary/80 transition-all sm:inline-flex hidden shadow-glow"
        >
          <span>Resume</span>
          <Download className="h-3 w-3" />
        </a>
      </div>
    </header>
  );
}
