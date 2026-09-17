"use client";

import { useState } from "react";
import type { CheckResult, RegulationId, ScanReport } from "@/lib/types";

const REGULATION_OPTIONS: {
  id: RegulationId;
  name: string;
  region: string;
  description: string;
}[] = [
  {
    id: "GDPR",
    name: "GDPR",
    region: "European Union",
    description: "General Data Protection Regulation",
  },
  {
    id: "CPRA",
    name: "CPRA (CCPA)",
    region: "California, USA",
    description: "California Privacy Rights Act",
  },
  {
    id: "DPDP",
    name: "DPDP Act",
    region: "India",
    description: "Digital Personal Data Protection Act",
  },
];

type Stage = "idle" | "scanning" | "done" | "error";

function scoreColor(score: number) {
  if (score >= 7.5) return "#1a7f4e";
  if (score >= 5) return "#b26a00";
  return "#b3261e";
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
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
        stroke="#e2e8f0"
        strokeWidth={10}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
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
        fill="#14213d"
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

function CheckRow({ check }: { check: CheckResult }) {
  const isFail = check.status === "fail";
  const color = isFail ? "#b3261e" : "#b26a00";
  const bg = isFail ? "#fdecea" : "#fef6e7";
  const mark = check.status === "pass" ? "✓" : isFail ? "✗" : "!";

  return (
    <li className="rounded-lg border border-slate-200 p-3" style={{ background: bg }}>
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: color }}
        >
          {mark}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{check.label}</p>
          <p className="mt-0.5 text-xs text-slate-600">{check.detail}</p>
          {check.regulations.length > 0 && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
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
    <li className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          {"✓"}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{check.label}</p>
          <p className="mt-0.5 text-xs text-slate-600">{check.detail}</p>
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
      "This prototype does not persist scan results to a database — everything happens in your browser session. The PDF is generated on demand, and the \"email report\" feature is currently a stub that does not send real email yet.",
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
        <span className="text-sm font-semibold text-slate-800">
          {item.question}
        </span>
        <span
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          {"+"}
        </span>
      </button>
      {isOpen && (
        <p className="pb-4 pr-8 text-sm text-slate-600">{item.answer}</p>
      )}
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-1 text-lg font-bold text-[#14213d]">
        Frequently asked questions
      </p>
      <p className="mb-2 text-sm text-slate-500">
        A quick primer on what ComplianceScope does and how to read your
        results.
      </p>
      <div>
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
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-[#0f2540]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white font-bold">
              CS
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">
                ComplianceScope
              </p>
              <p className="text-[11px] text-slate-300 leading-none mt-1">
                Website regulatory compliance scanner
              </p>
            </div>
          </div>
          <p className="hidden sm:block text-xs text-slate-300">
            GDPR &middot; CPRA &middot; DPDP
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <section className="mb-8">
          <h1 className="text-2xl font-bold text-[#14213d]">
            Check your website against data privacy regulations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Enter a website URL, choose which regional regulations apply to your
            business, and run an automated technical scan. You&apos;ll get a
            score per regulation, a list of what&apos;s working, and concrete
            suggestions to close the gaps.
          </p>
        </section>

        {/* Step 1 & 2: input card */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label
              htmlFor="url"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Step 1 &middot; Website URL
            </label>
            <input
              id="url"
              type="text"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#0f2540] focus:ring-2 focus:ring-[#0f2540]/20"
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Step 2 &middot; Regulations to scan against
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {REGULATION_OPTIONS.map((opt) => {
                const checked = selectedRegs.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleRegulation(opt.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      checked
                        ? "border-[#0f2540] bg-[#0f2540]/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        {opt.name}
                      </span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                          checked
                            ? "border-[#0f2540] bg-[#0f2540] text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        {"✓"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{opt.region}</p>
                    <p className="text-[11px] text-slate-400">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={runScan}
              disabled={stage === "scanning"}
              className="rounded-lg bg-[#0f2540] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16325a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {stage === "scanning" ? "Scanning…" : "Run Scan"}
            </button>
          </div>

          {errorMsg && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </p>
          )}
        </section>

        {stage === "scanning" && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0f2540]" />
              <p className="text-sm text-slate-600">
                Fetching the page, checking headers, and analyzing compliance
                signals&hellip;
              </p>
            </div>
          </section>
        )}

        {/* Step 4: results */}
        {report && stage === "done" && (
          <>
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Step 4 &middot; Scan results for {report.url}
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
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-800">
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

            {/* Step 5: strengths & suggestions */}
            <section className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="mb-3 text-sm font-bold text-[#14213d]">
                  Step 5 &middot; What&apos;s working well
                </p>
                {report.strengths.length === 0 ? (
                  <p className="text-sm text-slate-500">No passing checks found.</p>
                ) : (
                  <ul className="space-y-2">
                    {report.strengths.map((c) => (
                      <StrengthRow key={c.id} check={c} />
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="mb-3 text-sm font-bold text-[#14213d]">
                  Suggested improvements
                </p>
                {report.suggestions.length === 0 ? (
                  <p className="text-sm text-slate-500">No issues found.</p>
                ) : (
                  <ul className="space-y-2">
                    {report.suggestions.map((c) => (
                      <CheckRow key={c.id} check={c} />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Step 6: download + email */}
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-bold text-[#14213d]">
                Step 6 &middot; Download or email the report
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={downloadPdf}
                  disabled={pdfDownloading}
                  className="rounded-lg border border-[#0f2540] px-4 py-2.5 text-sm font-semibold text-[#0f2540] transition hover:bg-[#0f2540]/5 disabled:opacity-60"
                >
                  {pdfDownloading ? "Preparing PDF…" : "Download PDF report"}
                </button>
                <div className="flex flex-1 gap-2">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0f2540] focus:ring-2 focus:ring-[#0f2540]/20"
                  />
                  <button
                    onClick={sendEmail}
                    disabled={emailStatus === "sending" || !email.trim()}
                    className="rounded-lg bg-[#0f2540] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16325a] disabled:cursor-not-allowed disabled:opacity-60"
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

        <FaqSection />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-6 text-xs text-slate-400">
          ComplianceScope is a prototype. Automated scans are informational only
          and do not constitute legal advice.
        </div>
      </footer>
    </div>
  );
}
