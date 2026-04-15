"use client";

import { Card } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { usePostEditor } from "@/hooks/feed/usePostEditor";

import { Stack } from "@/components/layout/Stack";
import PostContextBar from "./PostContextBar";
import PostEditorHeader from "./PostEditorHeader";
import PostAuthoritySelector from "./PostAuthoritySelector";
import PostTypeSelector from "./PostTypeSelector";
import PostEditorMetadata from "./PostEditorMetadata";
import PostEditorContent from "./PostEditorContent";
import PostEditorAttachments from "./PostEditorAttachments";

export default function PostEditorModal({ isOpen, onClose, post = null }) {

  const { data: profile } = useMyProfile();
  const editor = usePostEditor(post);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

        <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">

          <PostEditorHeader
            profile={profile}
            post={post}
            editor={editor}
            onClose={onClose}
            onSubmit={() => editor.submit(onClose)}
            onDelete={() => editor.remove(onClose)}
          />

          <div className="flex-1 overflow-y-auto p-4">

            <Stack gap="gap-4">
              <PostContextBar profile={profile} editor={editor} />

              <div className="flex gap-4 justify-between">
                  <PostTypeSelector
                    type={editor.type}
                    setType={editor.setType}
                  />                  

                  <PostAuthoritySelector
                    governance_entities={editor.governance_entities}
                    setSelectedAuthorities={editor.setSelectedAuthorities}
                    mode="editor"
                  />
              </div>

              <PostEditorMetadata editor={editor} />

              <PostEditorContent
                title={editor.title}
                setTitle={editor.setTitle}
                content={editor.content}
                setContent={editor.setContent}
              />

              <PostEditorAttachments
                attachments={editor.attachments}
                setAttachments={editor.setAttachments}
              />

            </Stack>

          </div>

        </Card>

      </div>
    </>
  );
}