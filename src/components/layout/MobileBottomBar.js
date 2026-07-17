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
        className="flex flex-col items-center text-muted-foreground"
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </button>

      <button
        onClick={() =>
          user ? router.push("/action") : router.push("/auth/login")
        }
        className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <CirclePlus className="h-6 w-6" />
      </button>

      <button onClick={toggleSidebar} className={itemClass(false)}>
        <Menu className="h-6 w-6" />
        <span>Menu</span>
      </button>
    </div>
  );
}
