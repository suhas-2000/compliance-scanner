# ComplianceScope

A prototype website compliance scanner. Enter a website URL, pick which
regional data-privacy regulations apply (GDPR, CPRA/CCPA, DPDP), and run an
automated technical scan that checks things like HTTPS, security headers,
privacy policy presence, cookie consent mechanisms, and CPRA "Do Not
Sell/Share" links. Get a 0-10 score per regulation, a breakdown of what's
working and what needs improvement, and a downloadable PDF report.

## Status

Early prototype:

- The scan is a **technical crawl only** (no AI reading of policy text yet)
  and is informational, not legal advice.
- PDF report generation works.
- Emailing the report is currently **stubbed** — no email is actually sent
  yet. See `src/app/api/send-email/route.ts` for where to wire up a real
  provider (SendGrid/Postmark/SES, etc).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- cheerio for HTML parsing
- pdfkit for PDF report generation

## Project structure

- `src/lib/scanner.ts` — fetches a page and runs the compliance checks
- `src/lib/rules.ts` — regulation metadata (GDPR, CPRA, DPDP)
- `src/lib/scoring.ts` — turns check results into per-regulation scores
- `src/lib/pdf.ts` — renders the PDF report
- `src/app/api/scan/route.ts` — scan endpoint
- `src/app/api/report-pdf/route.ts` — PDF export endpoint
- `src/app/api/send-email/route.ts` — email endpoint (stub)
- `src/app/page.tsx` — the single-page UI
