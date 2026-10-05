"use client";

import { useRouter } from "next/router";
import PageHeader from "@/components/layout/PageHeader";
import AdminSettingsShell from "@/components/layout/AdminSettingsShell";
import Appearance from "@/components/system/Appearance";
import Notifications from "@/components/system/Notification";
import Support from "@/components/system/Support";
import About from "@/components/about/About";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";

export default function SettingsPage() {
  const router = useRouter();
  const activeTab = typeof router.query.tab === "string" ? router.query.tab : "appearance";

  const content = {
    appearance: <Appearance />,
    notifications: <Notifications />,
    privacy: <PrivacyPolicy />,
    support: <Support />,
    about: <About />,
  };

  return (
    <div className="w-full">
      <PageHeader items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />
      <AdminSettingsShell
        title="Settings"
        description="Manage your Citizen Action account and preferences."
        tabs={[
          { value: "appearance", label: "Appearance" },
          { value: "notifications", label: "Notifications" },
          { value: "privacy", label: "Privacy" },
          { value: "support", label: "Support" },
          { value: "about", label: "About" },
        ]}
      >
        <div className="w-full">{content[activeTab] || content.appearance}</div>
      </AdminSettingsShell>
    </div>
  );
}
