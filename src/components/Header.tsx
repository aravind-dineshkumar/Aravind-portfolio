import {ArrowDownToLine, Menu, X} from 'lucide-react';
import {useState} from 'react';

interface HeaderProps {
  name: string;
  resumeUrl: string;
}

const NAV_ITEMS = [
  {label: 'About', href: '#about'},
  {label: 'Education', href: '#education'},
  {label: 'Projects', href: '#projects'},
  {label: 'Skills', href: '#skills'},
  {label: 'Contact', href: '#contact'},
];

export function Header({name, resumeUrl}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#F8F8F6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
        >
          {name}
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-zinc-950 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={resumeUrl}
            download="Aravind_Dineshkumar_Resume.pdf"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download Resume</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-900 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-6 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-950"
              >
                {item.label}
              </a>
            ))}
            <a
              href={resumeUrl}
              download="Aravind_Dineshkumar_Resume.pdf"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download Resume</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
