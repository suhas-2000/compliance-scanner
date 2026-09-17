import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions | ComplianceScope",
  description: "The terms that govern use of the ComplianceScope scanner.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-[var(--ink)]">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Last updated: 17 September 2026
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By using ComplianceScope (&quot;the Service&quot;), you agree to
            these Terms &amp; Conditions. If you do not agree, please do not
            use the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            ComplianceScope runs an automated technical scan of a website you
            submit and reports on common signals relevant to GDPR, CPRA/CCPA,
            and DPDP. <strong>The Service is informational only.</strong> It
            does not constitute legal advice, a compliance certification, or
            a substitute for review by qualified legal counsel.
          </p>
        </Section>

        <Section title="3. Authorized Use">
          <p>
            You agree to only submit URLs for websites you own or are
            otherwise authorized to assess. You will not use the Service to
            scan third-party websites without permission, or to attempt to
            disrupt, overload, or gain unauthorized access to any system.
          </p>
        </Section>

        <Section title="4. No Warranty">
          <p>
            The Service is provided &quot;as is&quot; without warranties of
            any kind. Automated scans may produce false positives, false
            negatives, or incomplete results, and regulations change over
            time. We do not guarantee that a passing score means your website
            is fully compliant with any regulation.
          </p>
        </Section>

        <Section title="5. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, ComplianceScope and its
            operators are not liable for any damages arising from your use
            of, or reliance on, the Service or its reports.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            The Service&apos;s design, code, and content are owned by
            ComplianceScope unless otherwise noted. Reports generated for
            your own website are yours to use.
          </p>
        </Section>

        <Section title="7. Changes">
          <p>
            We may update the Service or these Terms at any time. Continued
            use after changes take effect constitutes acceptance of the
            updated Terms.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Questions about these Terms? Reach us via the{" "}
            <a href="/#contact" className="font-medium text-[var(--teal)] underline underline-offset-2">
              contact section
            </a>{" "}
            on our homepage.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
