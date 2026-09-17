import Link from "next/link";

const NAV_LINKS = [
  { href: "/#scan", label: "Scan" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--navy)] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 4 5v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10V5l-8-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="m8.5 12 2.4 2.4L15.5 9.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-bold leading-none text-[var(--ink)]">
              ComplianceScope
            </span>
            <span className="mt-1 block text-[10.5px] leading-none text-slate-400">
              Website compliance scanner
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-slate-500 transition hover:text-[var(--navy)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
