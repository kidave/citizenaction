"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const { data: profile } = useMyProfile();

  const { data: spaces = [] } = useSpaces();

  const postEditor = usePostEditor(mode === "post" ? item : null);

  const contributionEditor = useContributionEditor(
    mode === "contribution" ? item : null,
    post,
  );

  const editor = mode === "post" ? postEditor : contributionEditor;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-full w-full max-w-none flex-col overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-xl">
        {/* Header */}
        <EditorHeader
          mode={mode}
          profile={profile}
          editor={editor}
          spaces={spaces}
        />

        {/* Scrollable Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {mode === "post" && (
              <div className="mb-4">
                <EditorType type={editor.type} setType={editor.setType} />
              </div>
            )}

            <EditorContent
              mode={mode}
              title={editor.title}
              setTitle={editor.setTitle}
              content={editor.content}
              setContent={editor.setContent}
            />
          </div>

          {/* Attachment Preview */}
          <EditorAttachments
            attachments={editor.attachments}
            setAttachments={editor.setAttachments}
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
    </Dialog>
  );
}
