"use client";

import { useRouter } from "next/router";
import { Home, CirclePlus, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomBar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background md:hidden">
      <button
        onClick={() => router.push("/")}
        className="flex flex-1 flex-col items-center justify-center text-muted-foreground"
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </button>

      <button
        onClick={() =>
          user ? router.push("/action") : router.push("/auth/login")
        }
        className="flex flex-1 flex-col items-center justify-center text-muted-foreground"
      >
        <CirclePlus className="h-5 w-5" />
        <span className="text-xs">Action</span>
      </button>

      <button
        onClick={toggleSidebar}
        className="flex flex-1 flex-col items-center justify-center text-muted-foreground"
      >
        <Menu className="h-5 w-5" />
        <span className="text-xs">Menu</span>
      </button>
    </div>
  );
}
