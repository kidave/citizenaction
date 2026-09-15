"use client";

import dynamic from "next/dynamic";

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
  setContentFormat,
  attachments,
  addAttachments,
  onFocus,
}) {
  return (
    <RichEditor
      key="universal-post-editor"
      type="post"
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
      editorConfig={{
        label: "Post",
        rich: true,
        placeholder: "Share an update, idea, report, meeting notes, or anything the community should know",
      }}
    />
  );
}
