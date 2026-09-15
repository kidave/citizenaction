"use client";

import dynamic from "next/dynamic";

import PlainEditor from "./PlainEditor";
import { getEditorTypeConfig } from "./editorTypes";

const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
});

export default function EditorContent({
  type = "post",
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
  const editorConfig =
    type === "post"
      ? {
          label: "Post",
          rich: true,
          placeholder:
            "Share an update, idea, report, meeting notes, or anything the community should know",
        }
      : getEditorTypeConfig(type);

  if (!editorConfig.rich) {
    return (
      <PlainEditor
        type={type}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        setContentJson={setContentJson}
        setContentFormat={setContentFormat}
        onFocus={onFocus}
        editorConfig={editorConfig}
      />
    );
  }

  return (
    <RichEditor
      key={type}
      type={type}
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
      editorConfig={editorConfig}
    />
  );
}
