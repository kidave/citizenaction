"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";

import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";

import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";

import EditorHeader from "./EditorHeader";
import EditorContent from "./EditorContent";
import EditorAttachments from "./EditorAttachments";
import EditorFooter from "./EditorFooter";

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

  /*
   * =========================================================
   * EDITOR
   * =========================================================
   */

  const postEditor = usePostEditor(mode === "post" ? item : null, initialSpace);

  const contributionEditor = useContributionEditor(
    mode === "contribution" ? item : null,
    post,
  );

  const editor = mode === "post" ? postEditor : contributionEditor;

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-xl">
        {loading ? (
          <EditorModalSkeleton />
        ) : (
          <>
            {/* HEADER */}

            <EditorHeader
              mode={mode}
              profile={profile}
              editor={editor}
              spaces={spaces}
            />

            {/* CONTENT + ATTACHMENTS */}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* EDITOR */}

              <EditorContent
                type={editor.type}
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

              {/* ATTACHMENTS */}

              <EditorAttachments
                attachments={editor.attachments}
                setAttachments={editor.setAttachments}
                open={attachmentsOpen}
                setOpen={setAttachmentsOpen}
              />
            </div>

            {/* FOOTER */}

            <EditorFooter
              mode={mode}
              item={item}
              editor={editor}
              onClose={onClose}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
