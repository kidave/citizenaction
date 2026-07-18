import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="p-10">
          <article className="prose prose-slate dark:prose-invert max-w-none">
            {/* Title */}
            <header className="mb-10">
              <h1 className="mb-2">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">
                Effective Date: September 13, 2025
              </p>
            </header>

            {/* Intro */}
            <section className="mb-10">
              <p>
                Walking Project respects your privacy and is committed to
                protecting your personal information. This Privacy Policy
                explains how we collect, use, and share your information when
                you use our platform and services.
              </p>
            </section>

            {/* Section 1 */}
            <section className="mb-10">
              <h2>1. Information We Collect</h2>
              <ul>
                <li>
                  <strong>Account Information:</strong> When you sign in with
                  Google, we collect your name, email address, and profile
                  picture.
                </li>
                <li>
                  <strong>App Usage Data:</strong> Information about how you
                  interact with the platform, such as features used.
                </li>
                <li>
                  <strong>Device Information:</strong> Location data only if
                  explicitly permitted by you.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2>2. How We Use Your Information</h2>
              <ul>
                <li>Provide, maintain, and improve our services.</li>
                <li>Personalize your experience.</li>
                <li>Send important updates and security notifications.</li>
                <li>Analyze usage trends to improve platform performance.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2>3. Sharing Your Information</h2>
              <p>
                We do not sell your personal information. We may share
                information only with:
              </p>
              <ul>
                <li>
                  <strong>Supabase</strong> – for secure data storage and
                  backend services.
                </li>
                <li>
                  <strong>Google</strong> – solely for authentication purposes.
                </li>
                <li>Legal authorities if required by law.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2>4. Your Rights</h2>
              <ul>
                <li>Access, update, or delete your personal data.</li>
                <li>Withdraw consent where applicable.</li>
                <li>Opt out of non-essential communications.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2>5. Data Security</h2>
              <p>
                We implement reasonable technical and organizational measures to
                protect your information against unauthorized access or misuse.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2>6. Third-Party Services</h2>
              <p>
                Our platform relies on trusted third-party services. Their
                privacy practices are governed by their own policies:
              </p>
              <ul>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Supabase Privacy Policy
                  </a>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2>7. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be
                reflected by updating the effective date above.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-12">
              <h2>8. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, you can contact
                us at{" "}
                <a href="mailto:info@walkingproject.org">
                  info@walkingproject.org
                </a>
                .
              </p>
            </section>

            {/* Footer */}
            <footer className="border-t pt-8">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Walking Project
              </p>
              <p className="mt-2">
                <Link href="/" className="no-underline">
                  ← Back to home
                </Link>
              </p>
            </footer>
          </article>
        </Card>
      </div>
    </div>
  );
}
