"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import { useFloatingMenu } from "@/components/layout/FloatingMenuContext";

export default function FloatingMenu() {
  const router = useRouter();
  const { hasSidebarToggle, toggleSidebar } = useFloatingMenu();

  if (router.pathname !== "/" || !hasSidebarToggle) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-12 w-12 rounded-full"
        onClick={toggleSidebar}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
