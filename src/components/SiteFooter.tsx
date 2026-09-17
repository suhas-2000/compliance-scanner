import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} ComplianceScope. Automated scans
          are informational only and do not constitute legal advice.
        </p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-[var(--navy)]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[var(--navy)]">
            Terms &amp; Conditions
          </Link>
          <a href="/#contact" className="hover:text-[var(--navy)]">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
