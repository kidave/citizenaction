"use client";

import { useRouter } from "next/router";

import PageHeader from "@/components/navigation/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Appearance from "@/components/system/Appearance";
import Notifications from "@/components/system/Notification";
import Support from "@/components/system/Support";
import About from "@/components/system/About";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";

export default function SettingsPage() {
  const router = useRouter();

  const activeTab = router.query.tab || "appearance";

  function changeTab(value) {
    router.push(
      {
        pathname: "/settings",
        query: { tab: value },
      },
      undefined,
      { shallow: true },
    );
  }

  const navigation = (
    <div className="border-t border-border/70">
      <div className="mx-auto flex min-h-12 max-w-6xl items-center justify-center overflow-x-auto px-2 py-1.5 sm:px-4 sm:py-0">
        <TabsList className="w-max">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full">
      <Tabs value={activeTab} onValueChange={changeTab}>
        <PageHeader
          items={[
            { label: "Home", href: "/" },
            { label: "Settings" },
          ]}
          title="Settings"
          bottom={navigation}
        />

        <TabsContent value="appearance" className="mx-auto max-w-lg p-2 sm:p-4">
          <Appearance />
        </TabsContent>

        <TabsContent
          value="notifications"
          className="mx-auto max-w-lg p-2 sm:p-4"
        >
          <Notifications />
        </TabsContent>

        <TabsContent value="privacy" className="mx-auto max-w-2xl p-2 sm:p-4">
          <PrivacyPolicy />
        </TabsContent>

        <TabsContent value="support" className="mx-auto max-w-lg p-2 sm:p-4">
          <Support />
        </TabsContent>

        <TabsContent value="about" className="mx-auto max-w-lg p-2 sm:p-4">
          <About />
        </TabsContent>
      </Tabs>
    </div>
  );
}
