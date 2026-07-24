"use client";

import { useState } from "react";

import { useRouter } from "next/router";

import Image from "next/image";

import Link from "next/link";

import { Sparkles, Plus } from "lucide-react";

import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";

import { useMyProfile } from "@/hooks/user/useMyProfile";

import { Card } from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { LoginModal } from "@/components/auth/LoginModal";

export default function CreatePostTrigger() {
  const router = useRouter();

  const { user } = useAuth();

  const { data: profile } = useMyProfile();

  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      router.push("/action");
    }
  };

  return (
    <>
      <motion.div
        transition={{
          duration: 0.2,
        }}
      >
        <Card className="relative hidden overflow-hidden rounded-[28px] md:block">
          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="relative z-10 p-4">
            <div className="flex items-center gap-4">
              {/* =====================================================
                  AVATAR
              ===================================================== */}

              {user && profile ? (
                <Link href={`/user/${profile.username}`}>
                  <Avatar className="h-12 w-12 cursor-pointer border-2">
                    <AvatarImage src={profile.avatar_url || undefined} />

                    <AvatarFallback>
                      {profile.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar
                  onClick={() => setShowLogin(true)}
                  className="h-12 w-12 cursor-pointer border-2"
                >
                  <AvatarFallback>
                    <div className="relative h-7 w-7">
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

              {/* =====================================================
                  TRIGGER
              ===================================================== */}

              <div onClick={handleClick} className="flex-1 cursor-pointer">
                <Card className="group relative overflow-hidden rounded-2xl bg-muted px-5 py-4 transition-all duration-300">
                  {/* INNER BG */}

                  <div className="absolute inset-0 transition group-hover:opacity-100" />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    {/* TEXT */}

                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4" />

                        {user
                          ? "Document your action"
                          : "Login to document your action"}
                      </div>

                      <div className="mt-1 text-xs">
                        Share meetings, reports, updates, events and civic
                        progress
                      </div>
                    </div>

                    {/* BUTTON */}

                    <Card className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
                      <Plus className="h-4 w-4" />
                    </Card>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        message="You need to be signed in to document your action"
      />
    </>
  );
}
