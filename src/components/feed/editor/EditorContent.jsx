"use client";

import dynamic from "next/dynamic";

import PlainEditor from "./PlainEditor";

const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
});

export default function EditorContent({
  title,
  setTitle,
  content,
  setContent,
  contentJson,
  setContentJson,
  contentFormat,
  setContentFormat,
  attachments,
  addAttachments,
  onFocus,
  documentMode = false,
  showTitle = false,
}) {
  const useRichEditor = documentMode || contentFormat === "editorjs";

  if (!useRichEditor) {
    return (
      <PlainEditor
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        setContentJson={setContentJson}
        setContentFormat={setContentFormat}
        onFocus={onFocus}
        showTitle={showTitle}
      />
    );
  }

  return (
    <RichEditor
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      contentJson={contentJson}
      setContentJson={setContentJson}
      setContentFormat={setContentFormat}
      attachments={attachments}
      addAttachments={addAttachments}
      onFocus={onFocus}
      documentMode={documentMode}
      showTitle={showTitle}
    />
  );
}
