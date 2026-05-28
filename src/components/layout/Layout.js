"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";

import LeftSidebar from "./LeftSidebar";

import { motion } from "framer-motion";

function LayoutContent({ children }) {
  const pathname = usePathname();

  const { state } = useSidebar();

  const safePathname = pathname ?? "";

  const isAboutPage = safePathname === "/about";

  const isHomePage = safePathname === "/";

  const isPostPage = safePathname.startsWith("/post/");

  const isMeetingPage = safePathname.startsWith("/meeting/");

  return (
    <div className="flex min-h-screen w-full min-w-0">
      {!isAboutPage && <LeftSidebar />}

      <SidebarInset className="flex min-w-0 flex-1 flex-col">
        {/* FLOATING SIDEBAR BUTTON */}
        {isHomePage && state === "collapsed" && (
          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="fixed left-4 top-4 z-50 hidden md:block"
          >
            <SidebarTrigger className="rounded-xl border bg-background/80 p-2 shadow-lg backdrop-blur-xl" />
          </motion.div>
        )}

        <main className="w-full min-w-0">{children}</main>
      </SidebarInset>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
