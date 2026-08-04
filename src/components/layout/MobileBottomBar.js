"use client";

import { useRouter } from "next/router";
import { Home, CirclePlus, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MobileBottomBar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(64px+env(safe-area-inset-bottom))] items-center justify-around border-t border-border/50 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <Button onClick={() => router.push("/")} variant="ghost" size="icon">
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Button>

      <Button
        onClick={() =>
          user ? router.push("/action") : router.push("/auth/login")
        }
        variant="ghost"
        size="icon"
      >
        <CirclePlus className="h-6 w-6" />
        <span className="text-xs">Create</span>
      </Button>

      {user ? (
        <Button onClick={toggleSidebar} variant="outline" size="icon">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      ) : (
        <Button onClick={toggleSidebar} variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="text-xs">Menu</span>
        </Button>
      )}
    </div>
  );
}
