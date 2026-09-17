import { REGULATION_MAP } from "./rules";
import { CheckResult, RegulationId, RegulationScore, ScanReport } from "./types";

const STATUS_VALUE: Record<CheckResult["status"], number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

export function scoreRegulations(
  checks: CheckResult[],
  selected: RegulationId[]
): RegulationScore[] {
  return selected.map((regId) => {
    const relevant = checks.filter((c) => c.regulations.includes(regId));
    const totalWeight = relevant.reduce((sum, c) => sum + c.weight, 0);
    const earnedWeight = relevant.reduce(
      (sum, c) => sum + c.weight * STATUS_VALUE[c.status],
      0
    );
    const score = totalWeight === 0 ? 0 : (earnedWeight / totalWeight) * 10;

    return {
      regulation: regId,
      name: REGULATION_MAP[regId].name,
      score: Math.round(score * 10) / 10,
      passCount: relevant.filter((c) => c.status === "pass").length,
      failCount: relevant.filter((c) => c.status === "fail").length,
      warnCount: relevant.filter((c) => c.status === "warn").length,
    };
  });
}

export function buildReport(
  url: string,
  selected: RegulationId[],
  checks: CheckResult[]
): ScanReport {
  const regulationScores = scoreRegulations(checks, selected);
  const overallScore =
    regulationScores.length === 0
      ? 0
      : Math.round(
          (regulationScores.reduce((sum, r) => sum + r.score, 0) /
            regulationScores.length) *
            10
        ) / 10;

  const relevantChecks = checks.filter((c) =>
    c.regulations.some((r) => selected.includes(r))
  );
  const generalChecks = checks.filter((c) => c.regulations.length === 0);
  const allRelevant = [...relevantChecks, ...generalChecks];

  const strengths = allRelevant.filter((c) => c.status === "pass");
  const suggestions = allRelevant.filter((c) => c.status !== "pass");

  return {
    url,
    scannedAt: new Date().toISOString(),
    regulations: selected,
    overallScore,
    regulationScores,
    checks: allRelevant,
    strengths,
    suggestions,
  };
}
