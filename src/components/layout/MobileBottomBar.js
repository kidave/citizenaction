"use client";

import { motion } from "framer-motion";

import { useRouter } from "next/router";

import {
  Home,
  CirclePlus,
  Menu,
} from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { useAuth } from "@/context/AuthContext";

import { useMyProfile } from "@/hooks/user/useMyProfile";

export default function MobileBottomBar() {
  const router = useRouter();

  const { toggleSidebar } =
    useSidebar();

  const { user } = useAuth();

  const { data: profile } =
    useMyProfile();

  const pathname =
    router.pathname;

  const dockItem = (
    active = false
  ) => `
    relative
    flex
    h-12
    w-12
    items-center
    justify-center
    rounded-2xl
    transition-all
    duration-300
    ${
      active
        ? `
          bg-white/20
          text-foreground
          shadow-md
        `
        : `
          text-muted-foreground
          hover:bg-white/10
          hover:text-foreground
        `
    }
  `;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 100,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className="
        fixed
        bottom-4
        inset-x-0
        mx-auto
        z-50
        flex
        h-[72px]
        w-[260px]
        items-center
        justify-between
        rounded-[32px]
        border
        border-white/20
        bg-background/60
        px-4
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        backdrop-blur-2xl
        backdrop-saturate-150
        supports-[backdrop-filter]:bg-background/40
        md:hidden
      "
    >
      {/* HOME */}
      <motion.button
        whileTap={{
          scale: 0.9,
        }}
        whileHover={{
          scale: 1.05,
        }}
        onClick={() =>
          router.push("/")
        }
        className={dockItem(
          pathname === "/"
        )}
      >
        <Home className="h-5 w-5" />
      </motion.button>

      {/* CREATE */}
      <motion.button
        whileTap={{
          scale: 0.92,
        }}
        whileHover={{
          scale: 1.08,
        }}
        onClick={() =>
          user
            ? router.push(
                "/action"
              )
            : router.push(
                "/auth/login"
              )
        }
        className="
          relative
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-[20px]
          border
          border-white/30
          bg-white/20
          text-foreground
          shadow-[0_4px_20px_rgba(255,255,255,0.15)]
          backdrop-blur-xl
        "
      >
        {/* Glow */}
        <div
          className="
            absolute
            inset-0
            rounded-[20px]
            bg-white/10
            blur-xl
          "
        />

        <CirclePlus className="relative z-10 h-6 w-6" />
      </motion.button>

      {/* PROFILE / MENU */}
      <motion.button
        whileTap={{
          scale: 0.9,
        }}
        whileHover={{
          scale: 1.05,
        }}
        onClick={
          toggleSidebar
        }
        className={dockItem()}
      >
        {user ? (
          <Avatar className="h-12 w-12 border border-white/20">
            <AvatarImage
              src={
                profile?.avatar_url ||
                undefined
              }
            />

            <AvatarFallback>
              {profile?.name?.[0] ||
                "U"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </motion.button>
    </motion.div>
  );
}