"use client";

import { useRouter } from "next/router";

import UserTopbar from "@/components/user/UserTopbar";

import UserProfile from "@/components/user/UserProfile";
import EditProfile from "@/components/user/EditProfile";

export default function PublicProfilePage() {
  const router = useRouter();
  const { username, edit } = router.query;

  const isEditing = edit === "true";
  const title = isEditing
    ? "Edit Profile"
    : username
      ? `@${username}`
      : "Profile";

  return (
    <div className="mx-auto min-h-dvh max-w-6xl">
      <UserTopbar
        items={[{ label: "Home", href: "/" }, { label: title }]}
        title={title}
        backHref={isEditing && username ? `/user/${username}` : "/"}
      />

      <main className="mx-auto w-full">
        {isEditing ? <EditProfile /> : <UserProfile username={username} />}
      </main>
    </div>
  );
}
