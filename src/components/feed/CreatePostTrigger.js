"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoginModal } from "@/components/auth/LoginModal";
import CreatePostWaveAnimation from "./CreatePostWaveAnimation";

export default function CreatePostTrigger({ onCreate }) {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    onCreate?.();
  };

  return (
    <>
      <motion.div transition={{ duration: 0.2 }}>
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 p-4">
          {user && profile ? (
            <Link href={`/user/${profile.username}`}>
              <Avatar className="h-10 w-10 cursor-pointer border-2">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar
              onClick={() => setShowLogin(true)}
              className="h-10 w-10 cursor-pointer border-2"
            >
              <AvatarFallback>
                <div className="relative h-6 w-6">
                  <Image
                    src="/logo.png"
                    alt="Citizen Action"
                    fill
                    className="object-contain"
                  />
                </div>
              </AvatarFallback>
            </Avatar>
          )}

          <button
            type="button"
            onClick={handleClick}
            className="flex min-w-0 flex-1 text-left"
          >
            <Card className="relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-muted px-4 py-3 transition-colors">
              <CreatePostWaveAnimation />

              <div className="relative z-10 min-w-0">
                <div className="text-md flex items-center">
                  <span className="truncate">
                    {user
                      ? "Document your action"
                      : "Login or Signup to document your action"}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                <span className="text-lg leading-none">+</span>
              </div>
            </Card>
          </button>
        </div>
      </motion.div>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        message="You need to be signed in to add something"
      />
    </>
  );
}
