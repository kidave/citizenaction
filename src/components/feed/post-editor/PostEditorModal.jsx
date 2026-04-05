"use client";

import { Card } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/useMyProfile";
import { usePostEditor } from "@/hooks/feed/usePostEditor";

import { Stack } from "@/components/layout/Stack";
import { Inline } from "@/components/layout/Inline";

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
            onClose={onClose}
            onSubmit={() => editor.submit(onClose)}
            onDelete={() => editor.remove(onClose)}
          />

          <div className="flex-1 overflow-y-auto p-4">

            <Stack gap="gap-4">

              {/* Authority + Type */}
              <Inline gap="gap-4">

                <div className="flex-1 min-w-[220px]">
                  <PostAuthoritySelector
                    governance_entities={editor.governance_entities}
                    setSelectedAuthorities={editor.setSelectedAuthorities}
                    mode="editor"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <PostTypeSelector
                    type={editor.type}
                    setType={editor.setType}
                  />
                </div>

              </Inline>

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