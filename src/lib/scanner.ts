import * as cheerio from "cheerio";
import { CheckResult, RegulationId } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; ComplianceScannerBot/1.0; +https://example.com/bot)";

const TRACKER_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "Google Analytics", pattern: /google-analytics\.com|gtag\/js|googletagmanager\.com/i },
  { name: "Meta/Facebook Pixel", pattern: /connect\.facebook\.net/i },
  { name: "Google Ads", pattern: /googleadservices\.com|googlesyndication\.com/i },
  { name: "Hotjar", pattern: /static\.hotjar\.com/i },
  { name: "LinkedIn Insight", pattern: /snap\.licdn\.com/i },
  { name: "TikTok Pixel", pattern: /analytics\.tiktok\.com/i },
];

const CONSENT_PLATFORM_PATTERNS: RegExp[] = [
  /onetrust/i,
  /cookiebot/i,
  /cookieyes/i,
  /osano/i,
  /trustarc/i,
  /iubenda/i,
  /quantcast/i,
  /cookie-?consent/i,
  /cookie-?banner/i,
  /cookie-?notice/i,
  /didomi/i,
  /usercentrics/i,
];

export interface FetchedPage {
  finalUrl: string;
  status: number;
  headers: Headers;
  html: string;
}

export async function fetchPage(inputUrl: string): Promise<FetchedPage> {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
    });
    const html = await res.text();
    return { finalUrl: res.url || url, status: res.status, headers: res.headers, html };
  } finally {
    clearTimeout(timeout);
  }
}

function textIncludesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

export function runChecks(page: FetchedPage): CheckResult[] {
  const $ = cheerio.load(page.html);
  const bodyText = $("body").text().toLowerCase();
  const rawHtml = page.html;
  const links = $("a")
    .map((_, el) => ({
      href: ($(el).attr("href") || "").toLowerCase(),
      text: $(el).text().toLowerCase().trim(),
    }))
    .get();

  const scriptSrcs = $("script[src]")
    .map((_, el) => $(el).attr("src") || "")
    .get();
  const inlineScripts = $("script:not([src])")
    .map((_, el) => $(el).html() || "")
    .get()
    .join("\n");
  const allScriptContent = scriptSrcs.join("\n") + "\n" + inlineScripts;

  const checks: CheckResult[] = [];

  const isHttps = page.finalUrl.startsWith("https://");
  checks.push({
    id: "https",
    label: "Site served over HTTPS",
    status: isHttps ? "pass" : "fail",
    detail: isHttps
      ? "The site loads over an encrypted HTTPS connection."
      : "The site does not load over HTTPS. Encryption in transit is a baseline expectation under all three regulations.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 3,
  });

  const hsts = page.headers.get("strict-transport-security");
  checks.push({
    id: "hsts",
    label: "HTTP Strict Transport Security (HSTS) header",
    status: hsts ? "pass" : "warn",
    detail: hsts
      ? "HSTS header found, forcing browsers to use HTTPS."
      : "No Strict-Transport-Security header found. Recommended to prevent protocol downgrade attacks.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 1,
  });

  const csp = page.headers.get("content-security-policy");
  checks.push({
    id: "csp",
    label: "Content-Security-Policy header",
    status: csp ? "pass" : "warn",
    detail: csp
      ? "A Content-Security-Policy header restricts what scripts/resources can load."
      : "No Content-Security-Policy header found. Helps limit unauthorized data collection via injected scripts.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 1,
  });

  const xcto = page.headers.get("x-content-type-options");
  const xfo = page.headers.get("x-frame-options") || (csp && /frame-ancestors/i.test(csp));
  checks.push({
    id: "security-headers",
    label: "Baseline security headers (X-Content-Type-Options / X-Frame-Options)",
    status: xcto && xfo ? "pass" : "warn",
    detail:
      xcto && xfo
        ? "Common hardening headers are present."
        : "Missing one or more of X-Content-Type-Options / X-Frame-Options (or CSP frame-ancestors). Good practice for protecting user data from clickjacking/MIME attacks.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 1,
  });

  const referrerPolicy = page.headers.get("referrer-policy");
  checks.push({
    id: "referrer-policy",
    label: "Referrer-Policy header",
    status: referrerPolicy ? "pass" : "warn",
    detail: referrerPolicy
      ? `Referrer-Policy set (${referrerPolicy}), limiting data leaked to third parties via the Referer header.`
      : "No Referrer-Policy header found. Without it, full URLs (sometimes containing sensitive data) may leak to third-party sites.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 1,
  });

  const hasPrivacyLink = links.some(
    (l) => l.text.includes("privacy") || l.href.includes("privacy")
  );
  checks.push({
    id: "privacy-policy-link",
    label: "Privacy Policy is linked",
    status: hasPrivacyLink ? "pass" : "fail",
    detail: hasPrivacyLink
      ? "A link to a privacy policy was found on the page."
      : "No link to a privacy policy was found on the homepage. All three regulations require a publicly accessible privacy notice.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 3,
  });

  const hasTermsLink = links.some(
    (l) => l.text.includes("terms") || l.href.includes("terms")
  );
  checks.push({
    id: "terms-link",
    label: "Terms of Service / Use is linked",
    status: hasTermsLink ? "pass" : "warn",
    detail: hasTermsLink
      ? "A link to terms of service/use was found."
      : "No terms of service/use link found on the homepage.",
    regulations: [],
    weight: 1,
  });

  const hasConsentPlatform = CONSENT_PLATFORM_PATTERNS.some((p) =>
    p.test(allScriptContent) || p.test(rawHtml)
  );
  const mentionsCookieConsent =
    textIncludesAny(bodyText, ["accept cookies", "cookie preferences", "manage cookies", "cookie settings"]) ||
    hasConsentPlatform;
  checks.push({
    id: "cookie-consent",
    label: "Cookie consent banner / mechanism detected",
    status: mentionsCookieConsent ? "pass" : "fail",
    detail: mentionsCookieConsent
      ? "A cookie consent banner or consent-management platform was detected."
      : "No cookie consent banner or consent-management platform detected. GDPR and DPDP generally require informed consent before setting non-essential cookies.",
    regulations: ["GDPR", "DPDP"],
    weight: 3,
  });

  const hasDoNotSellLink = links.some((l) =>
    textIncludesAny(l.text, [
      "do not sell",
      "do not share",
      "your privacy choices",
      "opt-out of sale",
      "opt out of sale",
    ])
  ) || textIncludesAny(bodyText, ["do not sell my personal information", "your privacy choices"]);
  checks.push({
    id: "do-not-sell",
    label: '"Do Not Sell/Share My Info" or "Your Privacy Choices" link',
    status: hasDoNotSellLink ? "pass" : "fail",
    detail: hasDoNotSellLink
      ? "A CPRA-style opt-out of sale/sharing link was found."
      : 'No "Do Not Sell or Share My Personal Information" / "Your Privacy Choices" link found. CPRA requires this for businesses that sell or share personal information.',
    regulations: ["CPRA"],
    weight: 3,
  });

  const hasDsarContact = textIncludesAny(bodyText, [
    "data protection officer",
    "dpo@",
    "privacy@",
    "data subject",
    "your rights",
    "exercise your rights",
    "request access to your data",
    "delete your data",
  ]);
  checks.push({
    id: "dsar-contact",
    label: "Data subject rights / DPO contact mentioned",
    status: hasDsarContact ? "pass" : "fail",
    detail: hasDsarContact
      ? "The page references data subject rights or a privacy/DPO contact channel."
      : "No mention of data subject rights or a privacy contact (e.g. DPO email) was found. GDPR requires a clear channel for individuals to exercise their rights.",
    regulations: ["GDPR"],
    weight: 2,
  });

  const hasGrievanceOfficer = textIncludesAny(bodyText, [
    "grievance officer",
    "grievance redressal",
  ]);
  checks.push({
    id: "grievance-officer",
    label: "Grievance Officer contact mentioned (DPDP)",
    status: hasGrievanceOfficer ? "pass" : "fail",
    detail: hasGrievanceOfficer
      ? "A Grievance Officer contact was found, as required under India's DPDP Act."
      : "No Grievance Officer contact found. The DPDP Act requires a designated Grievance Officer contact for data principals in India.",
    regulations: ["DPDP"],
    weight: 2,
  });

  const foundTrackers = TRACKER_PATTERNS.filter((t) => t.pattern.test(allScriptContent)).map(
    (t) => t.name
  );
  const trackersWithoutConsent = foundTrackers.length > 0 && !mentionsCookieConsent;
  checks.push({
    id: "trackers-before-consent",
    label: "Third-party trackers vs. consent mechanism",
    status:
      foundTrackers.length === 0 ? "pass" : trackersWithoutConsent ? "fail" : "warn",
    detail:
      foundTrackers.length === 0
        ? "No common third-party analytics/ad trackers detected on the homepage."
        : trackersWithoutConsent
        ? `Detected tracker(s) (${foundTrackers.join(", ")}) with no consent mechanism present. These may load and collect data before a user consents.`
        : `Detected tracker(s) (${foundTrackers.join(
            ", "
          )}) alongside a consent mechanism. Manually verify trackers only fire after consent is given.`,
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 2,
  });

  const setCookieHeader = page.headers.get("set-cookie") || "";
  const cookiesSet = setCookieHeader.length > 0;
  const cookiesSecureFlags =
    !cookiesSet ||
    (/secure/i.test(setCookieHeader) && /samesite/i.test(setCookieHeader));
  checks.push({
    id: "cookie-flags",
    label: "Server-set cookies use Secure/SameSite flags",
    status: !cookiesSet ? "pass" : cookiesSecureFlags ? "pass" : "warn",
    detail: !cookiesSet
      ? "No cookies were set by the server on initial page load."
      : cookiesSecureFlags
      ? "Cookies observed on initial load include Secure/SameSite attributes."
      : "Cookies observed on initial load are missing Secure and/or SameSite attributes, which help protect data in transit.",
    regulations: ["GDPR", "CPRA", "DPDP"],
    weight: 2,
  });

  return checks;
}
