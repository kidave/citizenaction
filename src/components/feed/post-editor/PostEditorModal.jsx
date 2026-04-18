"use client";

import { Card } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { usePostEditor } from "@/hooks/feed/usePostEditor";

import { Stack } from "@/components/layout/Stack";
import PostEditorContext from "./PostEditorContext";
import PostEditorHeader from "./PostEditorHeader";
import PostAuthoritySelector from "./PostAuthoritySelector";
import PostTypeSelector from "./PostTypeSelector";
import PostEditorMetadata from "./PostEditorMetadata";
import PostEditorContent from "./PostEditorContent";
import PostEditorAttachments from "./PostEditorAttachments";

export default function PostEditorModal({ isOpen, onClose, post = null }) {

  const { data: profile } = useMyProfile();

  const editor = usePostEditor(post, profile);

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

          {/* HEADER */}
          <PostEditorHeader
            profile={profile}
            post={post}
            editor={editor}
            isGlobal={editor.isGlobal}
            setIsGlobal={editor.setIsGlobal}
            onClose={onClose}
            onSubmit={() => editor.submit(onClose)}
            onDelete={() => editor.remove(onClose)}
          />

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-4">

            <Stack gap="gap-4">

              <PostEditorContext
                space_id={editor.space_id}
                setSpaceId={editor.setSpaceId}
                scope_type={editor.scope_type}
                setScopeType={editor.setScopeType}
                scope_code={editor.scope_code}
                setScopeCode={editor.setScopeCode}
                isGlobal={editor.isGlobal}
                setIsGlobal={editor.setIsGlobal}
                spaces={profile?.spaces || []}
                governance_entities={editor.governance_entities}
                setSelectedAuthorities={editor.setSelectedAuthorities}
              />

              {/* TYPE + AUTHORITY */}
              <div className="flex gap-4 justify-between">
                <PostTypeSelector
                  type={editor.type}
                  setType={editor.setType}
                />

                {/*
                <PostAuthoritySelector
                  governance_entities={editor.governance_entities}
                  setSelectedAuthorities={editor.setSelectedAuthorities}
                  mode="editor"
                />
                */}
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

              <div className="flex gap-3">

                {/* AUTHORITY */}
                <div className="flex-1">
                  <PostAuthoritySelector
                    governance_entities={editor.governance_entities}
                    setSelectedAuthorities={editor.setSelectedAuthorities}
                    context={{
                      space_id: editor.space_id,
                      scope_type: editor.scope_type,
                      scope_code: editor.scope_code,
                      isGlobal: editor.isGlobal,
                    }}
                  />
                </div>

                {/* ATTACHMENTS */}
                <div className="flex-1">
                  <PostEditorAttachments
                    attachments={editor.attachments}
                    setAttachments={editor.setAttachments}
                  />
                </div>

              </div>

            </Stack>

          </div>

        </Card>

      </div>
    </>
  );
}