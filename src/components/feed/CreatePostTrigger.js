"use client";

import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoginModal } from "@/components/auth/LoginModal";
import { useState } from "react";

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
      <Card className="mb-4 p-4">
        <div className="flex items-center gap-3">
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

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
