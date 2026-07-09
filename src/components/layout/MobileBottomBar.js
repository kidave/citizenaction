"use client";

import { Home, CirclePlus, Menu } from "lucide-react";
import { useRouter } from "next/router";

import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomBar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  const pathname = router.pathname;

  const itemClass = (active) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex h-16">
        <button
          onClick={() => router.push("/")}
          className={itemClass(pathname === "/")}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() =>
            user ? router.push("/action") : router.push("/auth/login")
          }
          className={itemClass(false)}
        >
          <CirclePlus className="h-5 w-5" />
          <span>Create</span>
        </button>

        <button onClick={toggleSidebar} className={itemClass(false)}>
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
