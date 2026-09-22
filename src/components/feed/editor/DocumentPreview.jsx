"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import PostHeader from "@/components/feed/post/PostHeader";
import PostContent from "@/components/feed/post/PostContent";

function getAuthorName(profile) {
  return profile?.display_name || profile?.full_name || profile?.name || "You";
}

function buildPreviewPost({ title, contentJson, profile, spaces, governance }) {
  return {
    id: "document-preview",
    slug: null,
    title: title || "",
    content: "",
    content_json: contentJson || null,
    content_format: "editorjs",
    author_id: profile?.id || null,
    author_username: profile?.username || profile?.user_name || "",
    author_name: getAuthorName(profile),
    author_avatar: profile?.avatar_url || null,
    created_at: new Date().toISOString(),
    spaces: Array.isArray(spaces) ? spaces : [],
    governance: Array.isArray(governance) ? governance : [],
    attachments: [],
    links: [],
  };
}

function PreviewCard({ post }) {
  return (
    <article className="relative overflow-hidden border-b p-0 sm:p-2">
      <div className="relative z-10 flex flex-col gap-4 p-3 sm:p-2">
        <PostHeader post={post} canEdit={false} />
        <div className="transition-opacity">
          <div className="sm:rounded-3xl sm:bg-muted sm:p-4">
            <PostContent post={post} forceExpanded />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DocumentPreview({
  open,
  onOpenChange,
  title,
  contentJson,
  profile,
  spaces = [],
  governance = [],
}) {
  const [viewport, setViewport] = useState("desktop");

  const post = buildPreviewPost({
    title,
    contentJson,
    profile,
    spaces,
    governance,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] max-h-[92dvh] w-[96vw] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-center border-b px-4 py-3 sm:px-5">
          <DialogTitle className="text-sm font-medium">Preview</DialogTitle>

          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              type="button"
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewport("desktop")}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </Button>
            <Button
              type="button"
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewport("mobile")}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-0 sm:p-8">
          {viewport === "mobile" ? (
            <div className="mx-auto min-h-full w-full max-w-[390px] overflow-hidden bg-background sm:min-h-0 sm:rounded-2xl sm:border sm:shadow-xl">
              <PreviewCard post={post} />
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-background shadow-sm">
              <PreviewCard post={post} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
