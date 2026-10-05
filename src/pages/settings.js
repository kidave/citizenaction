import Head from "next/head";
import PageHeader from "@/components/layout/PageHeader";
import Appearance from "@/components/system/Appearance";
import Notifications from "@/components/system/Notification";
import Support from "@/components/system/Support";
import About from "@/components/about/About";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const router = require("next/router").useRouter();
  const requestedTab = Array.isArray(router.query.tab) ? router.query.tab[0] : router.query.tab;
  const tabs = [
    { value: "appearance", label: "Appearance" },
    { value: "notifications", label: "Notifications" },
    { value: "privacy", label: "Privacy" },
    { value: "support", label: "Support" },
    { value: "about", label: "About" },
  ];
  const activeTab = tabs.some((item) => item.value === requestedTab) ? requestedTab : "appearance";

  return (
    <>
      <Head><title>Settings</title></Head>
      <PageHeader items={[{ label: "Home", href: "/" }, { label: "Settings" }]} />
      <div className="mx-auto w-full max-w-4xl px-2 pb-2 sm:px-4 sm:pb-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            router.push({ pathname: router.pathname, query: { ...router.query, tab: value } }, undefined, { shallow: true })
          }
          className="min-w-0"
        >
          <TabsList className="w-max max-w-full">
            {tabs.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="px-3 sm:px-4">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <main className="pt-4">
            <TabsContent value="appearance"><Appearance /></TabsContent>
            <TabsContent value="notifications"><Notifications /></TabsContent>
            <TabsContent value="privacy"><PrivacyPolicy /></TabsContent>
            <TabsContent value="support"><Support /></TabsContent>
            <TabsContent value="about"><About /></TabsContent>
          </main>
        </Tabs>
      </div>
    </>
  );
}
