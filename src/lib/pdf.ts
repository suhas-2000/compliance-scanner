import PDFDocument from "pdfkit";
import { ScanReport } from "./types";

const NAVY = "#0f2540";
const SLATE = "#3f4d5c";
const GREEN = "#1a7f4e";
const RED = "#b3261e";
const AMBER = "#b26a00";
const LIGHT_LINE = "#d8dee5";

function statusColor(status: string) {
  if (status === "pass") return GREEN;
  if (status === "fail") return RED;
  return AMBER;
}

export function generatePdfReport(report: ScanReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fillColor(NAVY)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Website Compliance Scan Report", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(10)
      .font("Helvetica")
      .fillColor(SLATE)
      .text(`Website: ${report.url}`)
      .text(`Scanned: ${new Date(report.scannedAt).toLocaleString()}`)
      .text(`Regulations checked: ${report.regulations.join(", ")}`);

    doc.moveDown(1);
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(NAVY)
      .text(`Overall Score: ${report.overallScore} / 10`);

    doc.moveDown(0.5);
    report.regulationScores.forEach((r) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(SLATE)
        .text(`${r.name}: ${r.score} / 10`, { continued: true })
        .font("Helvetica")
        .text(
          `   (${r.passCount} passed, ${r.warnCount} warnings, ${r.failCount} failed)`
        );
    });

    doc.moveDown(1);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor(LIGHT_LINE)
      .stroke();
    doc.moveDown(1);

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor(NAVY)
      .text("What the site is doing well");
    doc.moveDown(0.3);

    if (report.strengths.length === 0) {
      doc.fontSize(10).font("Helvetica").fillColor(SLATE).text("No passing checks found.");
    }
    report.strengths.forEach((c) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(statusColor(c.status))
        .text(`✓ ${c.label}`, { continued: false });
      doc.fontSize(9).font("Helvetica").fillColor(SLATE).text(c.detail, { indent: 12 });
      doc.moveDown(0.4);
    });

    doc.moveDown(0.5);
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor(NAVY)
      .text("Suggested improvements");
    doc.moveDown(0.3);

    if (report.suggestions.length === 0) {
      doc.fontSize(10).font("Helvetica").fillColor(SLATE).text("No issues found.");
    }
    report.suggestions.forEach((c) => {
      const mark = c.status === "fail" ? "✗" : "!";
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(statusColor(c.status))
        .text(`${mark} ${c.label}`, { continued: false });
      doc.fontSize(9).font("Helvetica").fillColor(SLATE).text(c.detail, { indent: 12 });
      doc.moveDown(0.4);
    });

    doc.moveDown(1);
    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor(SLATE)
      .text(
        "This is an automated technical scan and does not constitute legal advice or a certification of compliance. Consult qualified legal counsel for a full compliance assessment.",
        { align: "left" }
      );

    doc.end();
  });
}
