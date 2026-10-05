import Head from "next/head";
import PageHeader from "@/components/layout/PageHeader";
import AdminSettingsShell from "@/components/layout/AdminSettingsShell";
import Appearance from "@/components/system/Appearance";
import Notifications from "@/components/system/Notification";
import Support from "@/components/system/Support";
import About from "@/components/about/About";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";
import { TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <>
      <Head><title>Settings</title></Head>
      <PageHeader items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />
      <AdminSettingsShell
        tabs={[
          { value: "appearance", label: "Appearance" },
          { value: "notifications", label: "Notifications" },
          { value: "privacy", label: "Privacy" },
          { value: "support", label: "Support" },
          { value: "about", label: "About" },
        ]}
      >
        <TabsContent value="appearance"><Appearance /></TabsContent>
        <TabsContent value="notifications"><Notifications /></TabsContent>
        <TabsContent value="privacy"><PrivacyPolicy /></TabsContent>
        <TabsContent value="support"><Support /></TabsContent>
        <TabsContent value="about"><About /></TabsContent>
      </AdminSettingsShell>
    </>
  );
}
