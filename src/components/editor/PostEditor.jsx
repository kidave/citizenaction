"use client";

import dynamic from "next/dynamic";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";
import PostEditorLayout from "./PostEditorLayout";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import EditorAttachments from "./EditorAttachments";
import EditorContextSuggestions from "./EditorContextSuggestions";

const PlainTextEditor = dynamic(() => import("./content/PlainTextEditor"), {
  ssr: false,
});

export default function PostEditor({
  item = null,
  initialSpace = null,
  onClose,
  onCreated,
}) {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const editor = usePostEditor(item, initialSpace, { draftScope: "post" });

  if (profileLoading || spacesLoading || !profile)
    return <EditorModalSkeleton />;

  return (
    <PostEditorLayout
      header={
        <>
          <EditorHeader profile={profile} editor={editor} spaces={spaces} />
          <EditorContextSuggestions editor={editor} />
        </>
      }
      content={
        <div className="editor-scroll flex h-full min-h-0 flex-col">
          <PlainTextEditor
            content={editor.content}
            setContent={editor.setContent}
            setContentJson={editor.setContentJson}
            setContentFormat={editor.setContentFormat}
          />
          <div className="mt-auto shrink-0">
            <EditorAttachments
              attachments={editor.attachments}
              setAttachments={editor.setAttachments}
              links={editor.links}
            />
          </div>
        </div>
      }
      footer={
        <EditorFooter
          editor={editor}
          item={item}
          onClose={onClose}
          onCreated={onCreated}
          showDocumentAction={!item}
          onDocumentMode={() => {
            onClose?.();
            window.location.assign("/document");
          }}
        />
      }
    />
  );
}
