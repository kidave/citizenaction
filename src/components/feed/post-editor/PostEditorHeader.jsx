"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PostEditorHeader({
  profile,
  post,
  onClose,
  onSubmit,
  onDelete
}) {

  return (
    <div className="border-b p-4 space-y-2">

      <div className="flex items-center justify-between">

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

        <div className="flex gap-2">

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