"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";

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
        query: {
          tab: value,
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

  return (
    <div className="mx-auto w-full">
      {/* ======================================
          FULL-WIDTH HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <h1 className="truncate font-semibold sm:text-lg">Settings</h1>
        </div>
      </header>

      {/* ======================================
          TABS
      ====================================== */}

      <Tabs value={activeTab} onValueChange={changeTab}>
        <div className="sticky top-14 z-30 flex justify-center overflow-x-auto border-b bg-background p-2 sm:top-16">
          <TabsList className="flex w-max">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>

            <TabsTrigger value="notifications">Notifications</TabsTrigger>

            <TabsTrigger value="privacy">Privacy</TabsTrigger>

            <TabsTrigger value="support">Support</TabsTrigger>

            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </div>

        {/* ======================================
            CONTENT
        ====================================== */}

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
