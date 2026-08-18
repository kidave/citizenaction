"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";
import UserProfile from "@/components/profile/UserProfile";

export default function PublicProfilePage() {
  const router = useRouter();

  const { username } = router.query;

  return (
    <div className="min-h-dvh w-full">
      {/* ======================================
          FULL-WIDTH HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="relative flex h-14 w-full items-center px-4 sm:h-16">
          <BackButton />

          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <h1 className="max-w-[60%] truncate text-center font-semibold sm:text-lg">
              {username ? `@${username}` : "Profile"}
            </h1>
          </div>
        </div>
      </header>

      {/* ======================================
          PROFILE CONTENT
      ====================================== */}

      <div className="mx-auto w-full max-w-xl">
        <UserProfile username={username} />
      </div>
    </div>
  );
}
