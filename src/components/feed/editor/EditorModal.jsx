"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";

import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";

import EditorHeader from "./EditorHeader";
import EditorContent from "./EditorContent";
import EditorAttachments from "./EditorAttachments";
import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";
import EditorType from "./EditorType";

import InlineLinkInput from "@/components/ui/InlineLinkInput";

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
  console.log("item", item);

  const editor = mode === "post" ? postEditor : contributionEditor;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-lg">
        <EditorHeader
          mode={mode}
          profile={profile}
          item={item}
          editor={editor}
          spaces={spaces}
          onClose={onClose}
          onDelete={() => editor.remove(onClose)}
        />

        <div className="flex h-full flex-1 flex-col overflow-hidden p-4">
          {mode === "post" && (
            <EditorType type={editor.type} setType={editor.setType} />
          )}

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <EditorContent
              mode={mode}
              title={editor.title}
              setTitle={editor.setTitle}
              content={editor.content}
              setContent={editor.setContent}
            />
          </div>

          <div className="mt-4">
            <EditorAttachments
              attachments={editor.attachments}
              setAttachments={editor.setAttachments}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <EditorDateTime editor={editor} />

            <EditorAddress editor={editor} />

            <InlineLinkInput
              value={editor.meeting_link}
              onChange={editor.setMeetingLink}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => editor.submit(onClose)}>
              <Save className="h-4 w-4" />

              {mode === "post"
                ? item
                  ? "Update Post"
                  : "Create Post"
                : item
                  ? "Update Contribution"
                  : "Add Contribution"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
