"use client";

import dynamic from "next/dynamic";
import EditorShell from "./EditorShell";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import EditorContextSuggestions from "./EditorContextSuggestions";
import DocumentPreview from "./DocumentPreview";
import { usePostEditor } from "@/hooks/editor/usePostEditor";

const RichTextEditor = dynamic(() => import("./content/RichTextEditor"), { ssr: false });

export default function DocumentEditor({ profile, spaces = [], post = null, previewOpen, onPreviewOpenChange, onClose, onCreated }) {
  const editor = usePostEditor(post, null, { draftScope: "document" });

  return (
    <EditorShell
      header={
        <>
          <EditorHeader
            profile={profile}
            editor={editor}
            spaces={spaces}
            showTitle
            titlePlaceholder="Document title..."
            titleAriaLabel="Document title"
            documentStyle
          />
          <EditorContextSuggestions editor={editor} />
        </>
      }
      content={
        <div className="mx-auto flex min-h-0 h-full w-full max-w-4xl flex-col">
          <RichTextEditor
            content={editor.content}
            setContent={editor.setContent}
            contentJson={editor.contentJson}
            setContentJson={editor.setContentJson}
            setContentFormat={editor.setContentFormat}
            addAttachments={editor.addAttachments}
          />
        </div>
      }
      footer={
        <>
          <DocumentPreview
            open={previewOpen}
            onOpenChange={onPreviewOpenChange}
            title={editor.title}
            contentJson={editor.contentJson}
            profile={profile}
            spaces={editor.spaces}
            governance={editor.governance}
          />
          <EditorFooter
            editor={editor}
            item={post}
            onClose={onClose}
            onCreated={onCreated}
            showAttachments={false}
            showDateTime={false}
            showAddress={false}
            maxWidthClass="max-w-4xl"
          />
        </>
      }
    />
  );
}
