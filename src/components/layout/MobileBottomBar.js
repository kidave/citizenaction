"use client";

import { useRouter } from "next/router";
import { Home, CirclePlus, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useAuth } from "@/context/AuthContext";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MobileBottomBar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(64px+env(safe-area-inset-bottom))] items-center justify-around border-t border-border/50 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 md:hidden">
      <button
        onClick={() => router.push("/")}
        className="flex flex-col items-center text-muted-foreground"
      >
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </button>

      <button
        onClick={() =>
          user ? router.push("/action") : router.push("/auth/login")
        }
        className="flex flex-col items-center text-muted-foreground"
      >
        <CirclePlus className="h-6 w-6" />
        <span className="text-xs">Create</span>
      </button>

      {user ? (
        <button onClick={toggleSidebar} className="flex flex-col items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </button>
      ) : (
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
