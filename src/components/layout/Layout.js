"use client";

import { useRouter } from "next/router";

import AppShell from "./AppShell";

function LayoutContent({ children }) {
  const { pathname } = useRouter();

  const isTimelinePage = /^\/space\/[^/]+\/timeline(?:\/)?$/.test(pathname);
  const useShell = pathname !== "/about" && !isTimelinePage;

  if (!useShell) {
    return children;
  }

  return <AppShell>{children}</AppShell>;
}

export default function Layout({ children }) {
  return <LayoutContent>{children}</LayoutContent>;
}
