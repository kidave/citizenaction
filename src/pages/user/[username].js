"use client";

import { useRouter } from "next/router";
import UserProfile from "@/components/profile/UserProfile";

export default function PublicProfilePage() {
  const { username } = useRouter().query;

  return <UserProfile username={username} />;
}
