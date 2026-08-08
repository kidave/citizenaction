"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";

import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";

import EditorHeader from "./EditorHeader";
import EditorType from "./EditorType";
import EditorContent from "./EditorContent";
import EditorAttachments from "./EditorAttachments";
import EditorFooter from "./EditorFooter";

export default function EditorModal({
  isOpen,
  onClose,
  mode = "post",
  item = null,
  post = null,
}) {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const loading = profileLoading || spacesLoading;

  const postEditor = usePostEditor(mode === "post" ? item : null);

  const contributionEditor = useContributionEditor(
    mode === "contribution" ? item : null,
    post,
  );

  const editor = mode === "post" ? postEditor : contributionEditor;
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {loading ? (
        <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-xl">
          <EditorModalSkeleton />
        </DialogContent>
      ) : (
        <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-xl">
          {/* Header */}
          <EditorHeader
            mode={mode}
            profile={profile}
            editor={editor}
            spaces={spaces}
          />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
              {mode === "post" && (
                <div className="mb-3 shrink-0">
                  <EditorType type={editor.type} setType={editor.setType} />
                </div>
              )}

              <EditorContent
                mode={mode}
                title={editor.title}
                setTitle={editor.setTitle}
                content={editor.content}
                setContent={editor.setContent}
                onFocus={() => setAttachmentsOpen(false)}
              />
            </div>

            <EditorAttachments
              attachments={editor.attachments}
              setAttachments={editor.setAttachments}
              open={attachmentsOpen}
              setOpen={setAttachmentsOpen}
            />
          </div>

          {/* Footer */}
          <EditorFooter
            mode={mode}
            item={item}
            editor={editor}
            onClose={onClose}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
