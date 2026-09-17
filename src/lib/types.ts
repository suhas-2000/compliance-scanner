export type RegulationId = "GDPR" | "CPRA" | "DPDP";

export interface Regulation {
  id: RegulationId;
  name: string;
  region: string;
  description: string;
}

export type CheckStatus = "pass" | "fail" | "warn";

export interface CheckResult {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  regulations: RegulationId[];
  weight: number;
}

export interface RegulationScore {
  regulation: RegulationId;
  name: string;
  score: number; // 0-10
  passCount: number;
  failCount: number;
  warnCount: number;
}

export interface ScanReport {
  url: string;
  scannedAt: string;
  regulations: RegulationId[];
  overallScore: number;
  regulationScores: RegulationScore[];
  checks: CheckResult[];
  strengths: CheckResult[];
  suggestions: CheckResult[];
  error?: string;
}
