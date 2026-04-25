"use client";

import { Card } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { usePostEditor } from "@/hooks/feed/usePostEditor";

import { Stack } from "@/components/layout/Stack";
import PostEditorContext from "./PostEditorContext";
import PostEditorHeader from "./PostEditorHeader";
import PostLocationSelector from "./PostLocationSelector";
import PostAuthoritySelector from "./PostAuthoritySelector";
import PostTypeSelector from "./PostTypeSelector";
import PostEditorMetadata from "./PostEditorMetadata";
import PostEditorContent from "./PostEditorContent";
import PostEditorAttachments from "./PostEditorAttachments";
import { Row } from "@/components/layout/Row";

export default function PostEditorModal({ isOpen, onClose, post = null }) {

  const { data: profile } = useMyProfile();

  const editor = usePostEditor(post, profile);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 hidden sm:block"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center">

        <Card
          className="
            w-full h-full rounded-none
            sm:max-w-2xl sm:max-h-[90vh] sm:rounded-lg
            flex flex-col
          "
        >

          {/* HEADER */}
          <PostEditorHeader
            profile={profile}
            post={post}
            editor={editor}
            onClose={onClose}
            onSubmit={() => editor.submit(onClose)}
            onDelete={() => editor.remove(onClose)}
          />

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-4">

            <Stack gap="gap-4">
              <div className="flex flex-wrap items-center gap-2">

                {/* TYPE */}
                <div className="flex-shrink-0">
                  <PostTypeSelector
                    type={editor.type}
                    setType={editor.setType}
                  />
                </div>

                {/* SPACE */}
                <div className="flex-shrink-0">
                  <PostEditorContext
                    editor={editor}
                    spaces={profile?.spaces || []}
                  />
                </div>

              </div>

              {/* METADATA */}
              <PostEditorMetadata editor={editor} />

              {/* CONTENT */}
              <PostEditorContent
                title={editor.title}
                setTitle={editor.setTitle}
                content={editor.content}
                setContent={editor.setContent}
              />

              <div className="w-full">

                {/* AUTHORITY 
                  <PostAuthoritySelector
                    governance_entities={editor.governance_entities}
                    setSelectedAuthorities={editor.setSelectedAuthorities}
                    context={{
                      space_id: editor.space_id,
                      scope_type: editor.scope_type,
                      scope_code: editor.scope_code,
                    }}
                  />
                */}
                {/* ATTACHMENTS */}
                  <PostEditorAttachments
                    attachments={editor.attachments}
                    setAttachments={editor.setAttachments}
                  />

              </div>

            </Stack>

          </div>

        </Card>

      </div>
    </>
  );
}