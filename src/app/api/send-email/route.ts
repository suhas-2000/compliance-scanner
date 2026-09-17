import { NextRequest, NextResponse } from "next/server";
import { ScanReport } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; report?: ScanReport };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim();
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!body.report) {
    return NextResponse.json({ error: "Missing report data." }, { status: 400 });
  }

  // NOTE: this is a stub for the prototype. No email is actually sent yet.
  // Wire this up to a real provider (e.g. SendGrid/Postmark/SES) before going live,
  // generating the PDF via generatePdfReport() and attaching it to the outgoing message.
  console.log(`[stub] Would email report for ${body.report.url} to ${email}`);

  return NextResponse.json({
    ok: true,
    stub: true,
    message: `Email delivery is not yet connected in this prototype. In production this would send the PDF report to ${email}.`,
  });
}
