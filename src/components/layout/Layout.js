"use client";

import { useRouter } from "next/router";

import AppShell from "./AppShell";

function LayoutContent({ children }) {
  const { pathname } = useRouter();

  const isTimelinePage = /^\/space\/[^/]+\/timeline(?:\/)?$/.test(pathname);
  const isGovernancePage = pathname === "/governance" || pathname.startsWith("/governance/");
  const useShell = pathname !== "/about" && !isTimelinePage && !isGovernancePage;

  if (!useShell) {
    return children;
  }

  return <AppShell>{children}</AppShell>;
}

export default function Layout({ children }) {
  return <LayoutContent>{children}</LayoutContent>;
}
