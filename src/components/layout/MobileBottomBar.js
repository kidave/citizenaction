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
    `flex flex-1 flex-col items-center justify-center gap-1 text-xs ${
      active ? "text-foreground" : "text-muted-foreground"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background md:hidden">
      <button
        onClick={() => router.push("/")}
        className={itemClass(pathname === "/")}
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => router.push(user ? "/action" : "/auth/login")}
        className={itemClass(false)}
      >
        <CirclePlus className="h-5 w-5" />
        <span>Create</span>
      </button>

      <button onClick={toggleSidebar} className={itemClass(false)}>
        <Menu className="h-5 w-5" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
