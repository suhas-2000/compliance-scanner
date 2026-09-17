"use client";

import { useState } from "react";
import type { CheckResult, RegulationId, ScanReport } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const REGULATION_OPTIONS: {
  id: RegulationId;
  name: string;
  region: string;
  code: string;
  description: string;
}[] = [
  {
    id: "GDPR",
    name: "GDPR",
    region: "European Union",
    code: "EU",
    description: "General Data Protection Regulation",
  },
  {
    id: "CPRA",
    name: "CPRA (CCPA)",
    region: "California, USA",
    code: "US-CA",
    description: "California Privacy Rights Act",
  },
  {
    id: "DPDP",
    name: "DPDP Act",
    region: "India",
    code: "IN",
    description: "Digital Personal Data Protection Act",
  },
];

type Stage = "idle" | "scanning" | "done" | "error";

function scoreColor(score: number) {
  if (score >= 7.5) return "#0f7c73";
  if (score >= 5) return "#b8862e";
  return "#b3261e";
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="m5 10.5 3.2 3.2L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCross({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="m6 6 8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconWarn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 7.5v3.75M10 14h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ScoreRing({ score, size = 128 }: { score: number; size?: number }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(10, score)) / 10;
  const offset = circumference * (1 - progress);
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#eef1f5"
        strokeWidth={11}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={11}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.24}
        fontWeight={700}
        fill="#0b1f33"
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

function CheckRow({ check }: { check: CheckResult }) {
  const isFail = check.status === "fail";
  const color = isFail ? "#b3261e" : "#b8862e";
  const bg = isFail ? "#fdf1f0" : "#fbf5ea";
  const border = isFail ? "#f4d9d6" : "#f0e2c4";
  const Icon = isFail ? IconCross : IconWarn;

  return (
    <li
      className="rounded-xl border p-3.5"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{check.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            {check.detail}
          </p>
          {check.regulations.length > 0 && (
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {check.regulations.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function StrengthRow({ check }: { check: CheckResult }) {
  return (
    <li className="rounded-xl border border-[#cfe8e4] bg-[#f2faf9] p-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--teal)] text-white">
          <IconCheck className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{check.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            {check.detail}
          </p>
        </div>
      </div>
    </li>
  );
}

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What does ComplianceScope actually check?",
    answer:
      "It runs an automated technical scan of your website's homepage: HTTPS usage, security headers, whether a privacy policy is linked, whether a cookie consent banner or consent-management platform is present, CPRA-style \"Do Not Sell/Share\" links, and mentions of data-subject-rights or grievance-officer contacts.",
  },
  {
    question: "Is this legal advice or an official compliance certification?",
    answer:
      "No. This is an informational, automated technical scan only. It cannot verify legal matters like your lawful basis for processing, data retention periods, or vendor contracts. Always consult qualified legal counsel for a full compliance assessment.",
  },
  {
    question: "Which regulations are currently supported?",
    answer:
      "GDPR (European Union), CPRA/CCPA (California, USA), and the DPDP Act (India). More regions can be added over time.",
  },
  {
    question: "How is the 0-10 score calculated?",
    answer:
      "Each regulation has a set of weighted checks relevant to it. A passing check earns full weight, a warning earns half weight, and a failing check earns none. The score is the weighted percentage of checks passed, scaled to 0-10.",
  },
  {
    question: "Do you store my website data or the scan results?",
    answer:
      "This prototype does not persist scan results to a database — everything happens in your browser session. The PDF is generated on demand, and the \"email report\" feature is currently a stub that does not send real email yet. See our Privacy Policy for details.",
  },
  {
    question: "How often should I re-scan my site?",
    answer:
      "Re-scan after any change to your privacy policy, cookie/consent setup, or when a regulation in your operating region is updated. As a baseline, a quarterly check is a reasonable habit.",
  },
];

function FaqItem({
  item,
  isOpen,
  onToggle,
}: {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[var(--ink)]">
          {item.question}
        </span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-transform ${
            isOpen ? "rotate-45 border-[var(--teal)] text-[var(--teal)]" : ""
          }`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <p className="pb-4 pr-8 text-sm leading-relaxed text-slate-600">
          {item.answer}
        </p>
      )}
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mt-16 scroll-mt-20 rounded-2xl border border-slate-200 p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
        Knowledge base
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--ink)]">
        Frequently asked questions
      </p>
      <p className="mt-1 text-sm text-slate-500">
        A quick primer on what ComplianceScope does and how to read your
        results.
      </p>
      <div className="mt-4">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem
            key={item.question}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}

const ROADMAP_ITEMS = [
  {
    title: "In-Depth Compliance Auditing",
    description:
      "AI-assisted reading of your actual privacy policy and terms to check for required clauses, not just their presence — closing the gap between \"a policy exists\" and \"a policy is adequate.\"",
  },
  {
    title: "Personalized Auditing & Monitoring",
    description:
      "Scheduled re-scans tailored to your business profile, with drift alerts the moment your compliance posture changes or a regulation you're tracking is updated.",
  },
  {
    title: "Multi-Page & Vendor Scanning",
    description:
      "Go beyond the homepage: crawl key pages (checkout, sign-up, account settings) and flag third-party scripts/vendors that may affect your compliance posture.",
  },
];

function RoadmapSection() {
  return (
    <section
      id="roadmap"
      className="mt-16 scroll-mt-20 rounded-2xl border border-slate-200 bg-gradient-to-b from-[#f7fafb] to-white p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
        What&apos;s next
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--ink)]">
        More depth is coming soon
      </p>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        The current scan focuses on fast, objective technical signals.
        Here&apos;s what we&apos;re building next to go deeper.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ROADMAP_ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <span className="inline-block rounded-full bg-[var(--navy)]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--navy)]">
              Coming soon
            </span>
            <p className="mt-3 text-sm font-bold text-[var(--ink)]">
              {item.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [feedback, setFeedback] = useState("");

  async function submit() {
    setStatus("sending");
    setFeedback("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setFeedback(data.error || "Could not send your message.");
        return;
      }
      setStatus("sent");
      setFeedback(data.message);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback("Could not reach the server. Try again.");
    }
  }

  return (
    <section
      id="contact"
      className="mt-16 scroll-mt-20 rounded-2xl border border-slate-200 p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
        Get in touch
      </p>
      <p className="mt-1 text-xl font-bold text-[var(--ink)]">Contact us</p>
      <p className="mt-1 max-w-xl text-sm text-slate-500">
        Questions about a scan result, a feature you&apos;d like to see, or
        anything else — send us a note.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/15"
        />
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/15"
        />
        <textarea
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/15"
        />
      </div>
      <button
        onClick={submit}
        disabled={status === "sending" || !name.trim() || !email.trim() || !message.trim()}
        className="mt-4 rounded-lg bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--navy-dark)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      {feedback && (
        <p
          className={`mt-3 text-xs ${
            status === "error" ? "text-red-600" : "text-slate-500"
          }`}
        >
          {feedback}
        </p>
      )}
    </section>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [selectedRegs, setSelectedRegs] = useState<RegulationId[]>([
    "GDPR",
    "CPRA",
    "DPDP",
  ]);
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [report, setReport] = useState<ScanReport | null>(null);

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [emailMessage, setEmailMessage] = useState("");
  const [pdfDownloading, setPdfDownloading] = useState(false);

  function toggleRegulation(id: RegulationId) {
    setSelectedRegs((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function runScan() {
    setErrorMsg("");
    setReport(null);
    setEmailStatus("idle");
    setEmailMessage("");

    if (!url.trim()) {
      setErrorMsg("Please enter a website URL.");
      return;
    }
    if (selectedRegs.length === 0) {
      setErrorMsg("Select at least one regulation to scan against.");
      return;
    }

    setStage("scanning");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, regulations: selectedRegs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong while scanning.");
        setStage("error");
        return;
      }
      setReport(data as ScanReport);
      setStage("done");
    } catch {
      setErrorMsg("Could not reach the scan service. Try again.");
      setStage("error");
    }
  }

  async function downloadPdf() {
    if (!report) return;
    setPdfDownloading(true);
    try {
      const res = await fetch("/api/report-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `compliance-report-${report.url.replace(/[^a-z0-9]/gi, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setErrorMsg("Could not generate the PDF. Try again.");
    } finally {
      setPdfDownloading(false);
    }
  }

  async function sendEmail() {
    if (!report || !email.trim()) return;
    setEmailStatus("sending");
    setEmailMessage("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, report }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailStatus("error");
        setEmailMessage(data.error || "Could not send the email.");
        return;
      }
      setEmailStatus("sent");
      setEmailMessage(data.message);
    } catch {
      setEmailStatus("error");
      setEmailMessage("Could not reach the email service.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16 pt-12">
        {/* Hero */}
        <section className="mb-10 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--teal)]/25 bg-[var(--teal)]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--teal)]">
            Automated compliance scanning
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[var(--ink)] sm:text-4xl">
            Check your website against data privacy regulations
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Enter a website URL, choose which regional regulations apply to
            your business, and run an automated technical scan. You&apos;ll
            get a score per regulation, a list of what&apos;s working, and
            concrete suggestions to close the gaps.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            {REGULATION_OPTIONS.map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                <span className="rounded bg-[var(--navy)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {opt.code}
                </span>
                {opt.name}
              </span>
            ))}
          </div>
        </section>

        {/* Scan card */}
        <section
          id="scan"
          className="scroll-mt-20 rounded-2xl border border-slate-200 p-6 shadow-[0_1px_2px_rgba(15,43,76,0.04)] sm:p-8"
        >
          <div>
            <label
              htmlFor="url"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Step 1 · Website URL
            </label>
            <input
              id="url"
              type="text"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--navy)] focus:ring-4 focus:ring-[var(--navy)]/10"
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Step 2 · Regulations to scan against
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {REGULATION_OPTIONS.map((opt) => {
                const checked = selectedRegs.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleRegulation(opt.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      checked
                        ? "border-[var(--navy)] bg-[var(--navy)]/[0.04] ring-1 ring-[var(--navy)]/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--ink)]">
                        {opt.name}
                      </span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-white transition ${
                          checked
                            ? "border-[var(--navy)] bg-[var(--navy)]"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {checked && <IconCheck className="h-3 w-3" />}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{opt.region}</p>
                    <p className="text-[11px] text-slate-400">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={runScan}
            disabled={stage === "scanning"}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--navy)] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[var(--navy-dark)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {stage === "scanning" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Scanning…
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path
                    d="M7 5.5v9l7-4.5-7-4.5Z"
                    fill="currentColor"
                  />
                </svg>
                Run Scan
              </>
            )}
          </button>

          {errorMsg && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </p>
          )}
        </section>

        {/* Step 4: results */}
        {report && stage === "done" && (
          <>
            <section className="mt-6 rounded-2xl border border-slate-200 p-6 sm:p-8 animate-fade-in-up">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Step 3 · Scan results for {report.url}
              </p>
              <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center">
                  <ScoreRing score={report.overallScore} />
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Overall score
                  </p>
                </div>
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  {report.regulationScores.map((r) => (
                    <div
                      key={r.regulation}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {r.name}
                      </p>
                      <p
                        className="mt-1 text-2xl font-bold"
                        style={{ color: scoreColor(r.score) }}
                      >
                        {r.score.toFixed(1)}
                        <span className="text-sm font-medium text-slate-400">
                          {" "}
                          / 10
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {r.passCount} passed &middot; {r.warnCount} warnings &middot;{" "}
                        {r.failCount} failed
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[11px] text-slate-400">
                This is an automated technical scan, not legal advice or a formal
                compliance certification.
              </p>
            </section>

            {/* strengths & suggestions */}
            <section className="mt-6 grid gap-6 sm:grid-cols-2 animate-fade-in-up">
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="mb-3 text-sm font-bold text-[var(--ink)]">
                  What&apos;s working well
                </p>
                {report.strengths.length === 0 ? (
                  <p className="text-sm text-slate-500">No passing checks found.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {report.strengths.map((c) => (
                      <StrengthRow key={c.id} check={c} />
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="mb-3 text-sm font-bold text-[var(--ink)]">
                  Suggested improvements
                </p>
                {report.suggestions.length === 0 ? (
                  <p className="text-sm text-slate-500">No issues found.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {report.suggestions.map((c) => (
                      <CheckRow key={c.id} check={c} />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* download + email */}
            <section className="mt-6 rounded-2xl border border-slate-200 p-6 sm:p-8 animate-fade-in-up">
              <p className="mb-3 text-sm font-bold text-[var(--ink)]">
                Download or email the report
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={downloadPdf}
                  disabled={pdfDownloading}
                  className="rounded-xl border-2 border-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)]/5 disabled:opacity-60"
                >
                  {pdfDownloading ? "Preparing PDF…" : "Download PDF report"}
                </button>
                <div className="flex flex-1 gap-2">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/10"
                  />
                  <button
                    onClick={sendEmail}
                    disabled={emailStatus === "sending" || !email.trim()}
                    className="rounded-xl bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--navy-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {emailStatus === "sending" ? "Sending…" : "Email me the report"}
                  </button>
                </div>
              </div>
              {emailMessage && (
                <p
                  className={`mt-3 text-xs ${
                    emailStatus === "error" ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {emailMessage}
                </p>
              )}
            </section>
          </>
        )}

        <RoadmapSection />
        <FaqSection />
        <ContactSection />
      </main>

      <SiteFooter />
    </div>
  );
}
