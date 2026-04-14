"use client";

import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoginModal } from "@/components/auth/LoginModal";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
      <Card className="hidden md:block mb-4 p-4">
        <div className="flex items-center gap-3">

          {/* Logged In → Avatar links to profile */}
          {user && profile ? (
            <Link href={`/user/${profile.username}`}>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            /* Not Logged In → Logo Avatar */
            <Avatar
              className="h-10 w-10 cursor-pointer"
              onClick={() => setShowLogin(true)}
            >
              <AvatarFallback className="bg-background">
                <div className="relative w-6 h-6">
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

          {/* Input Trigger */}
          <div
            className="flex-1 cursor-pointer"
            onClick={handleClick}
          >
            <div className="border border-input rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors">
              <div className="text-muted-foreground text-sm">
                {user
                  ? "Document your action!"
                  : "Login to document your action"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        message="You need to be signed in to document your action"
      />
    </>
  );
}