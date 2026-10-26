import Link from "next/link";

export default function TermsOfUse() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <header className="mb-10">
        <h1 className="mb-2">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Effective Date: October 26, 2026</p>
        <p>
          These Terms govern your access to and use of Citizen Action. By using
          the platform, you agree to these Terms. If you do not agree, please
          do not use the platform.
        </p>
      </header>

      <section className="mb-8">
        <h2>1. About the Platform</h2>
        <p>
          Citizen Action is an independent civic participation and documentation
          platform. It helps people organize around shared issues and places,
          contribute information and resources, and explore public organizations,
          governance and geographic context.
        </p>
      </section>
      <section className="mb-8">
        <h2>2. Accounts</h2>
        <p>
          You are responsible for using accurate account information, keeping
          access to your account secure, and activity carried out through your
          account. You must not impersonate another person or access an account
          without permission.
        </p>
      </section>
      <section className="mb-8">
        <h2>3. Contributions and Public Content</h2>
        <p>
          You retain any rights you hold in the content you submit. You grant
          Citizen Action permission to host, store, reproduce and display that
          content as reasonably necessary to operate the platform and show it
          to the audiences and users selected by you or required by the feature.
          You are responsible for ensuring you have the rights and permissions
          needed to submit content.
        </p>
        <p>
          Some contributions may be publicly visible. Do not post confidential
          information, another person&apos;s private information, or material you
          are not entitled to share. Review the visibility of a Space, post or
          other feature before contributing.
        </p>
      </section>
      <section className="mb-8">
        <h2>4. Acceptable Use</h2>
        <p>You agree not to use Citizen Action to:</p>
        <ul>
          <li>Break the law, threaten others, harass people or facilitate harm.</li>
          <li>Publish content that you know is fraudulent or unlawfully infringes another person&apos;s rights.</li>
          <li>Impersonate others or misrepresent your affiliation or authority.</li>
          <li>Attempt to bypass access controls, disrupt the service or compromise platform security.</li>
          <li>Upload malicious code, spam or content intended to interfere with others&apos; use of the platform.</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2>5. Civic and Third-Party Information</h2>
        <p>
          The platform may contain user-submitted material, public records,
          links and information from third-party sources. We do not guarantee
          that all content is complete, current or accurate. Verify important
          information with the relevant official source before relying on it.
          Links to third-party services are provided for convenience and are
          subject to those services&apos; own terms and policies.
        </p>
      </section>
      <section className="mb-8">
        <h2>6. Intellectual Property</h2>
        <p>
          The platform software, branding and other materials provided by
          Citizen Action may be protected by intellectual property laws. These
          Terms do not transfer ownership of those materials to you. You may
          use the platform only as permitted by law and these Terms.
        </p>
      </section>
      <section className="mb-8">
        <h2>7. Availability and Disclaimer</h2>
        <p>
          We may update, change, suspend or discontinue features as the platform
          develops. To the extent permitted by applicable law, the platform is
          provided on an as-available basis without guarantees that it will
          always be uninterrupted, error-free or suitable for every purpose.
        </p>
      </section>
      <section className="mb-8">
        <h2>8. Suspension or Termination</h2>
        <p>
          We may restrict or suspend access where reasonably necessary to
          protect users, platform security, comply with law or address a
          material breach of these Terms. You may stop using the platform at
          any time.
        </p>
      </section>
      <section className="mb-8">
        <h2>9. Changes to These Terms</h2>
        <p>
          We may revise these Terms as the platform or applicable requirements
          change. The effective date above indicates when this version was
          published. Continued use after updated Terms are published means
          you accept the revised Terms, to the extent permitted by law.
        </p>
      </section>
      <section className="mb-8">
        <h2>10. Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:contact@citizenaction.in">contact@citizenaction.in</a>.
        </p>
      </section>
      <footer className="border-t pt-8">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Citizen Action</p>
        <p className="mt-2"><Link href="/" className="no-underline">← Back to Citizen Action</Link></p>
      </footer>
    </article>
  );
}
