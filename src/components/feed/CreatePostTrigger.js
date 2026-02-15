"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useProfile from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreatePostModal from "./CreatePostModal";
import { LoginModal } from "@/components/auth/LoginModal";

export default function CreatePostTrigger() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setIsPostOpen(true);
    }
  };

  return (
    <>
      <Card className="mb-4 p-4">
        <div className="flex items-center gap-3">
          
          {/* AVATAR */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {/* TRIGGER */}
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

      {/* Post Modal */}
      {user && (
        <CreatePostModal
          isOpen={isPostOpen}
          onClose={() => setIsPostOpen(false)}
          initialContent=""
        />
      )}

      {/* Login Modal */}
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        message="You need to be signed in to document your action"
      />
    </>
  );
}
