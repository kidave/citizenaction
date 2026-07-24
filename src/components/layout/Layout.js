"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/router";

import AppShell from "./AppShell";

function LayoutContent({ children }) {
  const { pathname } = useRouter();

  const useShell = pathname !== "/about";

  if (!useShell) {
    return children;
  }

  return <AppShell>{children}</AppShell>;
}

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
