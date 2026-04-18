"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export default function PostEditorHeader({
  profile,
  post,
  isGlobal,
  setIsGlobal,
  onClose,
  onSubmit,
  onDelete
}) {

  return (
    <div className="border-b p-4 space-y-2">

      <div className="flex items-center justify-between">

        {/* USER */}
        <div className="flex items-center gap-3">
          <Image
            src={profile?.avatar_url || "/user1.png"}
            width={32}
            height={32}
            className="rounded-full"
            alt=""
          />

          <div className="text-sm font-medium">
            {profile?.name}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">

          {/* GLOBAL SWITCH */}
          <div className="flex items-center gap-2">
            <Switch
              checked={isGlobal}
              onCheckedChange={setIsGlobal}
            />
            <span className="text-xs text-muted-foreground">
              Global
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={onSubmit}
          >
            {post ? "Update" : "Post"}
          </Button>

        </div>

      </div>

    </div>
  );
}