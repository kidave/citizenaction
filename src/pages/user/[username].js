"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";
import UserProfile from "@/components/profile/UserProfile";

export default function PublicProfilePage() {
  const { username } = useRouter().query;

  return (
    <div className="mx-auto max-w-xl">
      <header className="space-y-4 px-4 py-4">
        <div className="flex items-start gap-2">
          <BackButton />
        </div>
      </header>

      <UserProfile username={username} />
    </div>
  );
}
