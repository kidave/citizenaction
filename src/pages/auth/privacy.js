// pages/privacy.js
export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "2rem" }}>
      <h1>Privacy Policy – Walking Project</h1>

      <p>Effective Date: September 13, 2025</p>

      <p>Walking Project respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your information when you use our app and services.</p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li><strong>Account Information:</strong> When you sign in with Google, we collect your name, email address, and profile picture.</li>
        <li><strong>App Usage Data:</strong> Data about your interactions with the app, such as feature usage.</li>
        <li><strong>Device Information:</strong> Location if granted, otherwise None</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the collected data for purposes including:</p>
      <ul>
        <li>Providing, maintaining, and improving our app and services.</li>
        <li>Personalizing your experience.</li>
        <li>Communicating updates, security alerts, and relevant notifications.</li>
        <li>Analyzing usage trends and app performance.</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li>Supabase, our backend provider, to store and manage app data securely.</li>
        <li>Google, only as required to authenticate your login.</li>
        <li>Law enforcement or legal authorities if required by law.</li>
      </ul>

      <h2>4. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal information stored in our app.</li>
        <li>Withdraw consent for data collection where applicable.</li>
        <li>Opt out of receiving promotional communications.</li>
      </ul>

      <h2>5. Data Security</h2>
      <p>We implement reasonable security measures to protect your information.</p>

      <h2>6. Third-Party Services</h2>
      <p>Our app uses Google login and Supabase. Their privacy practices are governed by their own privacy policies:</p>
      <ul>
        <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
        <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></li>
      </ul>

      <h2>7. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of changes by updating the effective date at the top of this page.</p>

      <h2>8. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@walkingproject.org">info@walkingproject.org</a>.</p>
    </div>
  );
}
