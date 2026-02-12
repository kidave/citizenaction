"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import CreatePostModal from "./CreatePostModal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function CreatePostTrigger() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Card className="mb-4 p-4">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.user_metadata?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>

          {/* TEXT TRIGGER */}
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="border border-input rounded-lg px-4 py-3 hover:bg-accent/50 transition-colors">
              <div className="text-muted-foreground text-sm">
                Document your action!
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* MODAL FOR CREATING POST */}
      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialContent=""
      />
    </>
  );
}