"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import PostHeader from "@/components/post/PostHeader";
import PostContent from "@/components/post/PostContent";

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
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-0 sm:p-8">
          <div className="mx-auto w-full max-w-4xl overflow-hidden bg-background sm:rounded-2xl sm:border sm:shadow-sm">
            <PreviewCard post={post} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
