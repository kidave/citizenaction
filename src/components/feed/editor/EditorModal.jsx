"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";
import EditorHeader from "./EditorHeader";
import EditorAttachments from "./EditorAttachments";
import EditorFooter from "./EditorFooter";
import PostTypeChooser from "./PostTypeChooser";

const EditorContent = dynamic(() => import("./EditorContent"), {
  ssr: false,
  loading: () => <EditorModalSkeleton />,
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

  const postEditor = usePostEditor(mode === "post" ? item : null, initialSpace);
  const contributionEditor = useContributionEditor(
    mode === "contribution" ? item : null,
    post,
  );
  const editor = mode === "post" ? postEditor : contributionEditor;
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  const hasStartedWriting = Boolean(
    editor.title?.trim() || editor.content?.trim(),
  );

  const showTypeChooser = mode === "post" && !item && !hasStartedWriting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-xl">
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

            {showTypeChooser && (
              <PostTypeChooser
                value={editor.type}
                onChange={editor.setType}
              />
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
