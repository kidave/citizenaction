import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <header className="mb-10">
        <h1 className="mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Effective Date: October 26, 2026
        </p>
        <p>
          This policy explains how Citizen Action handles information when you
          visit or use the platform.
        </p>
      </header>

      <section className="mb-8">
        <h2>1. About Citizen Action</h2>
        <p>
          Citizen Action is a civic documentation and participation platform
          an independent civic participation and documentation platform. It helps people
          document civic initiatives, share information and resources, and
          explore public organizations, governance and geographic context.
        </p>
        <p>
          For privacy questions or requests, contact us at{" "}
          <a href="mailto:contact@citizenaction.in">contact@citizenaction.in</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Information We Collect</h2>
        <p>The information we handle depends on how you use the platform.</p>
        <ul>
          <li>
            <strong>Account information:</strong> When you sign in with Google,
            Google may provide your name, email address and profile picture.
            We use account identifiers and authentication information needed
            to create and maintain your account. If another sign-in method is
            offered, we process the information needed for that method.
          </li>
          <li>
            <strong>Information you submit:</strong> This may include profile
            details, posts and contributions, uploaded documents and
            images, and information you add while participating in a Space or
            civic activity.
          </li>
          <li>
            <strong>Geographic information:</strong> You may associate content
            with a place, neighbourhood, jurisdiction or other geographic area.
            This information can be stored and displayed with that content.
            Choosing a place in the platform is not, by itself, a request for
            us to access your device&apos;s precise location.
          </li>
          <li>
            <strong>Technical and performance information:</strong> The
            platform uses Vercel Analytics and Speed Insights, which may
            process usage and performance information to help us understand
            reliability and improve the service. Service providers may also
            process technical information needed to operate, secure and
            troubleshoot their services.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>3. How We Use Information</h2>
        <p>We use information as needed to:</p>
        <ul>
          <li>Authenticate users and maintain accounts and sessions.</li>
          <li>Provide platform features and display content users submit.</li>
          <li>Organize civic information by topic, Space, person, organization or geography.</li>
          <li>Respond to support, privacy and account requests.</li>
          <li>Maintain platform security, prevent misuse and troubleshoot issues.</li>
          <li>Understand platform performance and improve usability and reliability.</li>
          <li>Meet applicable legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>4. Public Content and Visibility</h2>
        <p>
          Citizen Action is designed to support shared civic information.
          Content you submit to public areas of the platform, including posts
          and contributions, may be visible to other users or to the public.
          Information associated with public content, such as a display name,
          profile image or selected geography, may also be visible.
        </p>
        <p>
          Please do not submit passwords, financial account details, sensitive
          personal information or another person&apos;s private information unless
          there is a clear and appropriate reason and you have the right to
          share it. Check the visibility of a feature before submitting
          information.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. How We Share Information</h2>
        <p>
          We do not sell personal information. Information may be processed or
          shared in the following limited circumstances:
        </p>
        <ul>
          <li>
            <strong>Supabase:</strong> provides backend, database, storage and
            authentication services used by the platform.
          </li>
          <li>
            <strong>Google:</strong> provides Google sign-in when you choose
            that authentication method.
          </li>
          <li>
            <strong>Vercel:</strong> provides hosting and the platform&apos;s
            analytics and performance services.
          </li>
          <li>
            <strong>Legal and safety reasons:</strong> when disclosure is
            required by law or is reasonably necessary to protect the rights,
            safety and security of users or the platform.
          </li>
        </ul>
        <p>
          These providers process information under their own privacy
          policies and service terms. We do not control their independent
          practices.
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Google Sign-In</h2>
        <p>
          If you choose Google sign-in, Google shares the information needed
          for authentication and the basic account details you authorize.
          Citizen Action uses this information to sign you in, maintain your
          account and display relevant account details within the platform.
          We do not sell Google user data or use it to serve advertising.
        </p>
        <p>
          You can review Google&apos;s practices in the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy Policy
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2>7. Storage, Retention and Security</h2>
        <p>
          Account and submitted information is retained for as long as needed
          to provide the service, maintain platform records, resolve disputes
          and meet applicable legal obligations. Retention may vary by
          information type and feature. Deleting or changing content in the
          platform may not immediately remove copies held in backups or by
          service providers.
        </p>
        <p>
          We use reasonable technical and organizational measures intended to
          protect information. No online service or storage system can be
          guaranteed to be completely secure.
        </p>
      </section>

      <section className="mb-8">
        <h2>8. Your Choices and Privacy Requests</h2>
        <p>
          You can choose what information to submit and whether to use Google
          sign-in. Where platform features allow it, you can update your
          account details or content. You may also contact us to ask about
          accessing, correcting or deleting personal information, or to raise
          a privacy concern.
        </p>
        <p>
          Send requests to{" "}
          <a href="mailto:contact@citizenaction.in">contact@citizenaction.in</a>.
          We may need to verify your identity before acting on a request.
          Some information may need to be retained where required by law or
          where it is necessary to protect the platform and its users.
        </p>
      </section>

      <section className="mb-8">
        <h2>9. Third-Party Services</h2>
        <p>
          The platform relies on third-party services. Their privacy practices
          are described in their own policies:
        </p>
        <ul>
          <li>
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
              Supabase Privacy Policy
            </a>
          </li>
          <li>
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              Vercel Privacy Policy
            </a>
          </li>
          <li>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google Privacy Policy
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this policy as the platform or its practices change.
          The effective date at the top of this page indicates when this
          version was last updated. Material changes will be reflected in the
          published policy.
        </p>
      </section>

      <footer className="border-t pt-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Citizen Action
        </p>
        <p className="mt-2">
          <Link href="/" className="no-underline">
            ← Back to Citizen Action
          </Link>
        </p>
      </footer>
    </article>
  );
}
