import { Regulation, RegulationId } from "./types";

export const REGULATIONS: Regulation[] = [
  {
    id: "GDPR",
    name: "GDPR",
    region: "European Union",
    description:
      "General Data Protection Regulation — governs processing of personal data of individuals in the EU/EEA.",
  },
  {
    id: "CPRA",
    name: "CPRA (CCPA)",
    region: "California, USA",
    description:
      "California Privacy Rights Act — grants California residents rights over their personal information, including opt-out of sale/sharing.",
  },
  {
    id: "DPDP",
    name: "DPDP Act",
    region: "India",
    description:
      "Digital Personal Data Protection Act — governs processing of digital personal data of individuals in India.",
  },
];

export const REGULATION_MAP: Record<RegulationId, Regulation> =
  Object.fromEntries(REGULATIONS.map((r) => [r.id, r])) as Record<
    RegulationId,
    Regulation
  >;
