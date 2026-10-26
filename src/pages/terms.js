import Head from "next/head";
import Link from "next/link";
export default function TermsPage() {
  return (
    <>
      <Head><title key="title">Terms of Use | Citizen Action</title><meta name="description" content="Terms governing access to and use of Citizen Action." /></Head>
      <main className="min-h-dvh bg-muted/30 px-4 py-12">
        <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl rounded-xl border bg-background p-6 shadow-sm sm:p-10">
          <h1>Terms of Use</h1><p><strong>Effective date:</strong> October 26, 2026</p>
          <p>These terms govern your access to and use of Citizen Action. By using the platform, you agree to these terms. If you do not agree, please do not use the platform.</p>
          <h2>1. The platform</h2><p>Citizen Action is an independent civic documentation and participation platform for discovering and sharing civic information, community initiatives, resources, and structured information about public organizations, governance and geography.</p>
          <h2>2. Accounts</h2><p>You are responsible for maintaining the security of your account and for activity carried out through it. Provide accurate information and notify us if you believe your account has been accessed without authorization.</p>
          <h2>3. User contributions</h2><p>You are responsible for content you submit. You must have the rights and permissions needed to share it. Do not submit unlawful, fraudulent, abusive or infringing content, or private information about others without an appropriate lawful basis. You grant Citizen Action a non-exclusive permission to host, store, format and display your content as needed to operate the platform, subject to your settings and applicable law.</p>
          <h2>4. Public information</h2><p>Some contributions may be visible to other users or the public. User-submitted civic information may be incomplete, outdated or disputed. We do not guarantee that all content is accurate, complete or current; independently verify important information before relying on it.</p>
          <h2>5. Acceptable use</h2><ul><li>Do not use the platform in violation of applicable law.</li><li>Do not impersonate others or misrepresent affiliations.</li><li>Do not attempt unauthorized access or disrupt the platform.</li><li>Do not upload malicious code or content you lack permission to share.</li></ul>
          <h2>6. Intellectual property</h2><p>The platform's software, branding and original materials are protected by applicable law. User and third-party content remains subject to the rights of its respective owners.</p>
          <h2>7. Third-party services</h2><p>The platform may rely on third-party services or link to external websites. Those services are governed by their own terms and policies.</p>
          <h2>8. Availability and disclaimer</h2><p>The platform is provided on an “as available” basis to the extent permitted by law. We do not guarantee uninterrupted access or that every feature will always be available. These terms do not exclude rights or liabilities that cannot be excluded under applicable law.</p>
          <h2>9. Suspension</h2><p>We may restrict access when reasonably necessary to address misuse, security risks, violations of these terms or legal requirements.</p>
          <h2>10. Changes</h2><p>We may update these terms as the platform evolves. The effective date above indicates the latest version. Continued use after updated terms are published constitutes acceptance to the extent permitted by law.</p>
          <h2>11. Contact</h2><p>Questions can be sent to <a href="mailto:contact@citizenaction.in">contact@citizenaction.in</a>.</p>
          <hr/><p className="not-prose text-sm text-muted-foreground"><Link href="/">Back to Citizen Action</Link>{" · "}<Link href="/privacy">Privacy Policy</Link></p>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Citizen Action</p>
        </article>
      </main>
    </>
  );
}
