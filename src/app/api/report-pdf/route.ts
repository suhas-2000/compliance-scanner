import { NextRequest, NextResponse } from "next/server";
import { generatePdfReport } from "@/lib/pdf";
import { ScanReport } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let report: ScanReport;
  try {
    report = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid report data." }, { status: 400 });
  }

  if (!report || !report.url || !report.regulationScores) {
    return NextResponse.json({ error: "Invalid report data." }, { status: 400 });
  }

  const pdfBuffer = await generatePdfReport(report);
  const filename = `compliance-report-${report.url.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
