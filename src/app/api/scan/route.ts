import { NextRequest, NextResponse } from "next/server";
import { fetchPage, runChecks } from "@/lib/scanner";
import { buildReport } from "@/lib/scoring";
import { RegulationId } from "@/lib/types";

export const runtime = "nodejs";

const VALID_REGULATIONS: RegulationId[] = ["GDPR", "CPRA", "DPDP"];

export async function POST(req: NextRequest) {
  let body: { url?: string; regulations?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const url = (body.url || "").trim();
  const regulations = (body.regulations || []).filter((r): r is RegulationId =>
    VALID_REGULATIONS.includes(r as RegulationId)
  );

  if (!url) {
    return NextResponse.json({ error: "Please provide a website URL." }, { status: 400 });
  }
  if (regulations.length === 0) {
    return NextResponse.json(
      { error: "Please select at least one regulation to scan against." },
      { status: 400 }
    );
  }

  try {
    const page = await fetchPage(url);
    const checks = runChecks(page);
    const report = buildReport(page.finalUrl, regulations, checks);
    return NextResponse.json(report);
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "The website took too long to respond (timed out after 15s)."
        : "Could not reach that website. Check the URL and try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
