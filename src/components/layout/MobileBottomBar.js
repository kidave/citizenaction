"use client";

import { useRouter } from "next/router";
import { Home, CirclePlus, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useAuth } from "@/context/AuthContext";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function MobileBottomBar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-0
        z-40
        flex
        items-center
        justify-around
        border-t
        border-border/50
        bg-background/80
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/60
        md:hidden
      "
    >
      {/* HOME */}
      <button
        onClick={() => router.push("/")}
        className="flex flex-col items-center text-muted-foreground"
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </button>

      {/* CREATE POST (Center Floating Button) */}
      <button
        onClick={() =>
          user
            ? router.push("/action")
            : router.push("/auth/login")
        }
        className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <CirclePlus className="h-6 w-6" />
      </button>

      {/* RIGHT SIDE */}
      {user ? (
        // Logged In → Show Avatar
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      ) : (
        // Not Logged In → Show Menu Icon
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center text-muted-foreground"
        >
          <Menu className="h-6 w-6" />
          <span className="text-xs">Menu</span>
        </button>
      )}

    </div>
  );
}