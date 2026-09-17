import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | ComplianceScope",
  description: "How ComplianceScope collects, uses, and protects your data.",
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

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Last updated: 17 September 2026
        </p>

        <Section title="1. Overview">
          <p>
            ComplianceScope (&quot;we&quot;, &quot;us&quot;) provides an
            automated technical scan of a website you submit, to help
            evaluate common compliance signals relevant to GDPR, CPRA/CCPA,
            and India&apos;s DPDP Act. This policy explains what data we
            collect when you use the scanner and why.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            <strong>Website URLs you submit.</strong> We use the URL only to
            run the requested scan. We do not store scan results in a
            database in this version of the product &mdash; results exist in
            your browser session only.
          </p>
          <p>
            <strong>Email address (optional).</strong> If you choose to email
            yourself a report, we collect the address you enter for that
            single purpose. In the current version this feature is a
            non-functional demo and no email is actually sent or retained.
          </p>
          <p>
            <strong>Cookie preference.</strong> We store a single preference
            cookie/local-storage value recording whether you accepted or
            declined non-essential cookies. We currently set no analytics or
            advertising cookies.
          </p>
          <p>
            <strong>Standard server logs.</strong> Like most web services,
            our hosting provider may log basic technical data (IP address,
            timestamps, request metadata) for security and reliability
            purposes.
          </p>
        </Section>

        <Section title="3. How We Use Information">
          <p>
            To run the compliance scan you request, generate your report, and
            keep the service secure and reliable. We do not sell personal
            information and do not use it for advertising.
          </p>
        </Section>

        <Section title="4. Third Parties">
          <p>
            When you scan a website, our server fetches that site&apos;s
            publicly available homepage content on your behalf, the same way
            a browser would. We do not share the URLs you submit with any
            third party for marketing purposes.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            Scan results are not currently persisted server-side; they exist
            only in your browser for the duration of your session. If we
            introduce account-based history in the future, this policy will
            be updated accordingly.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            Depending on your region, you may have rights to access, correct,
            delete, or restrict processing of your personal information under
            GDPR, CPRA/CCPA, or the DPDP Act. Since we retain minimal data by
            design, most requests will simply confirm we hold nothing further
            to act on. Contact us using the details below to exercise these
            rights.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use industry-standard measures (HTTPS in transit, minimal data
            collection) to protect the limited information we process. No
            method of transmission is 100% secure.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this policy as the product evolves. We&apos;ll
            update the &quot;Last updated&quot; date above when we do.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about this policy? Reach us via the{" "}
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
