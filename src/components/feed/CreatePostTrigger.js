"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { LoginModal } from "@/components/auth/LoginModal";

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
      <motion.div
        transition={{
          duration: 0.2,
        }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 p-4">
          {/* AVATAR */}

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

          {/* CREATE TRIGGER */}

          <button
            type="button"
            onClick={handleClick}
            className="flex min-w-0 flex-1 text-left"
          >
            <Card className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3 transition-colors">
              <div className="min-w-0">
                <div className="text-md flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {user
                      ? "Document your action"
                      : "Login to document your action"}
                  </span>
                </div>

                <div className="mt-1 truncate text-sm text-muted-foreground">
                  Document meetings, reports, updates and events
                </div>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                <Plus className="h-4 w-4" />
              </div>
            </Card>
          </button>
        </div>
      </motion.div>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        message="You need to be signed in to document your action"
      />
    </>
  );
}
