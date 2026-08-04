"use client";

import { useRouter } from "next/router";

import PrivacyPolicy from "@/components/system/PrivacyPolicy";

export default function SettingsPage() {
  const router = useRouter();

  const tab = router.query.tab || "account";

  return (
    <div>
      {tab === "account" && (
        <>
          <h1 className="mb-2 text-3xl font-bold">Account</h1>

          <p className="text-muted-foreground">Account settings go here.</p>
        </>
      )}

      {tab === "appearance" && (
        <>
          <h1 className="mb-6 text-3xl font-bold">Appearance</h1>

          {/* Theme selector */}
        </>
      )}

      {tab === "notifications" && (
        <>
          <h1 className="mb-6 text-3xl font-bold">Notifications</h1>

          {/* Notifications */}
        </>
      )}

      {tab === "privacy" && <PrivacyPolicy />}

      {tab === "support" && (
        <>
          <h1 className="mb-6 text-3xl font-bold">Support</h1>

          {/* Support */}
        </>
      )}

      {tab === "about" && (
        <>
          <h1 className="mb-6 text-3xl font-bold">About</h1>

          {/* About */}
        </>
      )}
    </div>
  );
}
