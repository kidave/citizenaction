"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { useMyProfile } from "@/hooks/user/useMyProfile";
import { usePostEditor } from "@/hooks/feed/usePostEditor";
import { useSpaces } from "@/hooks/useSpaces";

import { Stack } from "@/components/layout/Stack";

import PostEditorHeader from "./PostEditorHeader";
import PostEditorContent from "./PostEditorContent";
import PostEditorAttachments from "./PostEditorAttachments";
import PostContextDrawer from "./PostContextDrawer";

export default function PostEditorModal({
  isOpen,
  onClose,
  post = null,
}) {

  const { data: profile } =
    useMyProfile();

  const {
    data: spaces = [],
  } = useSpaces();

  const editor =
    usePostEditor(
      post,
      profile
    );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >

      <DialogContent
        className="
          p-0
          gap-0
          w-full
          h-full
          max-w-none
          rounded-none

          sm:max-w-2xl
          sm:h-[90vh]
          sm:rounded-lg

          flex
          flex-col
          overflow-hidden
        "
      >

        {/* HEADER */}
        <PostEditorHeader
          profile={profile}
          post={post}
          editor={editor}
          spaces={spaces}
          onClose={onClose}
          onSubmit={() =>
            editor.submit(onClose)
          }
          onDelete={() =>
            editor.remove(onClose)
          }
        />

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">

          <Stack gap="gap-4">            

            {/* CONTENT */}
            <PostEditorContent
              title={editor.title}
              setTitle={editor.setTitle}
              content={editor.content}
              setContent={editor.setContent}
            />

            {/* ATTACHMENTS */}
            {/* =====================================================
                COMPOSER ACTIONS
            ===================================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              {/* ATTACHMENTS */}
              <div
                className="
                  flex-1
                  min-w-0
                "
              >

                <PostEditorAttachments
                  attachments={
                    editor.attachments
                  }
                  setAttachments={
                    editor.setAttachments
                  }
                />

              </div>

              {/* CONTEXT */}
              <div
                className="
                  shrink-0
                "
              >

                <PostContextDrawer
                  editor={editor}
                />

              </div>

            </div>

          </Stack>

        </div>

      </DialogContent>

    </Dialog>
  );
}