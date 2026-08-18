"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { SidebarInset } from "@/components/ui/sidebar";

import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import CenterColumn from "./CenterColumn";

export default function AppShell({ children }) {
  const { pathname } = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    const update = () => {
      setIsDesktop(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  const showRightSidebar = pathname === "/" && isDesktop;

  return (
    <div className="flex min-h-dvh w-full">
      <LeftSidebar />

      <SidebarInset className="flex-1">
        <CenterColumn>{children}</CenterColumn>
      </SidebarInset>

      {showRightSidebar && <RightSidebar />}
    </div>
  );
}
