"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";

import UserProfile from "@/components/profile/UserProfile";
import EditProfile from "@/components/profile/EditProfile";

export default function PublicProfilePage() {
  const router = useRouter();

  const { username, edit } = router.query;

  const isEditing = edit === "true";

  return (
    <div className="mx-auto min-h-dvh max-w-6xl">
      {/* ======================================
          FULL-WIDTH HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="relative flex h-14 w-full items-center px-4 sm:h-16">
          <BackButton />

          <div className="pointer-events-none absolute inset-x-0 flex justify-center">
            <h1 className="max-w-[60%] truncate text-center font-semibold sm:text-lg">
              {isEditing
                ? "Edit Profile"
                : username
                  ? `@${username}`
                  : "Profile"}
            </h1>
          </div>
        </div>
      </header>

      {/* ======================================
          CONTENT
      ====================================== */}

      <main className="mx-auto w-full">
        {isEditing ? <EditProfile /> : <UserProfile username={username} />}
      </main>
    </div>
  );
}
