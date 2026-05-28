"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { usePostEditor } from "@/hooks/feed/usePostEditor";
import { useSpaces } from "@/hooks/useSpaces";

import { Stack } from "@/components/layout/Stack";

import PostEditorHeader from "./PostEditorHeader";
import PostEditorContent from "./PostEditorContent";
import PostEditorAttachments from "./PostEditorAttachments";
import PostDateTime from "./PostDateTime";
import PostAddress from "./PostAddress";
import PostTypeSelector from "./PostTypeSelector";

import InlineLinkInput from "@/components/ui/InlineLinkInput";

export default function PostEditorModal({ isOpen, onClose, post = null }) {
  const { data: profile } = useMyProfile();

  const { data: spaces = [] } = useSpaces();

  const editor = usePostEditor(post, profile);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-2xl sm:rounded-lg">
        <PostEditorHeader
          profile={profile}
          post={post}
          editor={editor}
          spaces={spaces}
          onClose={onClose}
          onDelete={() => editor.remove(onClose)}
        />

        <div className="flex-1 overflow-y-auto p-4">
          <Stack gap="gap-4">
            <PostTypeSelector type={editor.type} setType={editor.setType} />

            <PostEditorContent
              title={editor.title}
              setTitle={editor.setTitle}
              content={editor.content}
              setContent={editor.setContent}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PostDateTime editor={editor} />

                <PostAddress editor={editor} />

                <InlineLinkInput
                  value={editor.meeting_link}
                  onChange={editor.setMeetingLink}
                />
              </div>

              <Button
                onClick={() => editor.submit(onClose)}
                className="shrink-0"
              >
                <Save className="h-4 w-4" />
                {post ? "Update" : "Post"}
              </Button>
            </div>

            <PostEditorAttachments
              attachments={editor.attachments}
              setAttachments={editor.setAttachments}
            />
          </Stack>
        </div>
      </DialogContent>
    </Dialog>
  );
}
