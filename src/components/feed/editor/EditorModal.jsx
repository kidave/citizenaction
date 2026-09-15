"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";
import EditorHeader from "./EditorHeader";
import EditorAttachments from "./EditorAttachments";
import EditorFooter from "./EditorFooter";
import EditorContextSuggestions from "./EditorContextSuggestions";
import PublishingAnimation from "@/components/animation/PublishingAnimation";

const EditorContent = dynamic(() => import("./EditorContent"), {
  ssr: false,
});

export default function EditorModal({
  isOpen,
  onClose,
  mode = "post",
  item = null,
  post = null,
  initialSpace = null,
}) {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const loading = profileLoading || spacesLoading;

  const router = useRouter();

  const postEditor = usePostEditor(mode === "post" ? item : null, initialSpace);
  const contributionEditor = useContributionEditor(
    mode === "contribution" ? item : null,
    post,
  );
  const editor = mode === "post" ? postEditor : contributionEditor;
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  const isPublishing = mode === "post" && Boolean(editor?.isSubmitting);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="relative flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 pr-1 sm:h-[90vh] sm:max-w-2xl sm:rounded-xl">
        {loading ? (
          <EditorModalSkeleton />
        ) : (
          <>
            <EditorHeader
              mode={mode}
              profile={profile}
              editor={editor}
              spaces={spaces}
            />

            {mode === "post" && <EditorContextSuggestions editor={editor} />}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <EditorContent
                title={editor.title}
                setTitle={editor.setTitle}
                content={editor.content}
                setContent={editor.setContent}
                contentJson={editor.contentJson}
                setContentJson={editor.setContentJson}
                setContentFormat={editor.setContentFormat}
                attachments={editor.attachments}
                addAttachments={editor.addAttachments}
                onFocus={() => setAttachmentsOpen(false)}
              />

              <EditorAttachments
                attachments={editor.attachments}
                setAttachments={editor.setAttachments}
                open={attachmentsOpen}
                setOpen={setAttachmentsOpen}
              />
            </div>

            <EditorFooter
              mode={mode}
              item={item}
              editor={editor}
              onClose={onClose}
              onCreated={(savedPost) => {
                onClose();

                if (savedPost?.slug) {
                  router.push(`/post/${savedPost.slug}`);
                }
              }}
            />

            {isPublishing && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 px-6 backdrop-blur-sm">
                <div className="flex w-full max-w-xs flex-col items-center justify-center rounded-2xl border bg-background/95 px-6 py-7 text-center shadow-lg">
                  <PublishingAnimation className="h-28 w-28" />
                  <div className="mt-2 text-base font-medium">Publishing your post</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Uploading media and finalizing your content…
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
