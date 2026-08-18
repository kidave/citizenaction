"use client";

import BackButton from "@/components/ui/back-button";
import EditProfile from "@/components/profile/EditProfile";

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-dvh w-full">
      {/* ======================================
          FULL-WIDTH HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="relative flex h-14 w-full items-center px-4 sm:h-16">
          <BackButton />

          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <h1 className="text-center font-semibold sm:text-lg">
              Edit Profile
            </h1>
          </div>
        </div>
      </header>

      {/* ======================================
          EDIT PROFILE CONTENT
      ====================================== */}

      <main className="w-full px-4 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-lg">
          <EditProfile />
        </div>
      </main>
    </div>
  );
}
