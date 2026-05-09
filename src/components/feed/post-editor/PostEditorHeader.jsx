"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Save } from "lucide-react";
import PostEditorContext from "./PostEditorContext";

export default function PostEditorHeader({
  profile,
  post,
  editor,
  onClose,
  onSubmit,
}) {
  const {
    mode,
    setMode,
    setSpaceId,
    setScopeType,
    setScopeCode,
    setScopeName,
  } = editor;

  function handleGlobalToggle(val) {
    if (val) {
      setMode("global");

      setSpaceId(null);
      setScopeType(null);
      setScopeCode(null);
      setScopeName(null);
    } else {
      setMode("space");
    }
  }

  return (
    <div className="border-b p-4 space-y-3">

      {/* ================= ROW 1 ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* USER */}
        <div className="flex justify-between gap-3">
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

          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-muted-foreground">
              Global
            </span>
            <Switch
              checked={mode === "global"}
              onCheckedChange={handleGlobalToggle}
            />
          </div>
          
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 justify-end w-full sm:w-auto">
          <PostEditorContext
            editor={editor}
            spaces={profile?.spaces || []}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={onSubmit}
            className="flex-1 sm:flex-none"
          >
            <Save/>
            {post ? "Update" : "Post"}
          </Button>

        </div>

      </div>

    </div>
  );
}