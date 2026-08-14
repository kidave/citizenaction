"use client";

import Linkify from "linkify-react";

import truncateContent from "@/utils/text/truncateContent";

import EditorRenderer from "@/components/editor/EditorRenderer";
import { editorBlocksToText } from "@/components/editor/editorUtils";

function LinkifiedText({ children }) {
  return (
    <Linkify
      options={{
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-info hover:underline break-all",

        render: ({ attributes, content }) => {
          const { class: className, ...rest } = attributes;

          return (
            <a
              {...rest}
              className={className}
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </a>
          );
        },
      }}
    >
      {children}
    </Linkify>
  );
}

function PlainPostContent({ post, onNavigate, forceExpanded }) {
  const content = post.content || "";

  const { text: truncatedText, isLong } = truncateContent(content, 280);

  const displayContent = forceExpanded || !isLong ? content : truncatedText;

  return (
    <div className="whitespace-pre-wrap text-sm">
      <LinkifiedText>{displayContent}</LinkifiedText>

      {!forceExpanded && isLong && (
        <button
          type="button"
          className="ml-2 cursor-pointer font-medium hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate?.();
          }}
        >
          Read more
        </button>
      )}
    </div>
  );
}

function RichPostContent({ post, onNavigate, forceExpanded }) {
  const blocks = post.content_json?.blocks || [];

  if (!blocks.length) {
    return null;
  }

  // =========================================================
  // SINGLE POST
  // Render the complete Editor.js document.
  // Images + captions are visible.
  // =========================================================

  if (forceExpanded) {
    return <EditorRenderer blocks={blocks} />;
  }

  // =========================================================
  // FEED
  // Never render Editor.js blocks.
  //
  // This means:
  // - images are hidden
  // - image captions are hidden
  // - tables are hidden
  // - embeds are hidden
  // - headers/list formatting are hidden
  //
  // post.content is the plain-text representation generated
  // from the Editor.js document.
  // =========================================================

  const content = post.content || "";

  const { text: truncatedText, isLong } = truncateContent(content, 280);

  const displayContent = isLong ? truncatedText : content;

  return (
    <div className="whitespace-pre-wrap text-sm">
      <LinkifiedText>{displayContent}</LinkifiedText>

      {isLong && (
        <button
          type="button"
          className="ml-2 cursor-pointer font-medium hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate?.();
          }}
        >
          Read more
        </button>
      )}
    </div>
  );
}

export default function PostContent({
  post,
  onNavigate,
  forceExpanded = false,
}) {
  const title = post.title || "";

  const isEditorJS = post.content_format === "editorjs";

  return (
    <div
      onClick={!forceExpanded ? () => onNavigate?.() : undefined}
      role={!forceExpanded ? "link" : undefined}
      tabIndex={!forceExpanded ? 0 : undefined}
      onKeyDown={(e) => {
        if (!forceExpanded && e.key === "Enter") {
          onNavigate?.();
        }
      }}
      className={!forceExpanded ? "cursor-pointer" : ""}
    >
      <div className="space-y-3">
        {title && <div className="mb-2 font-medium">{title}</div>}

        {isEditorJS ? (
          <RichPostContent
            post={post}
            onNavigate={onNavigate}
            forceExpanded={forceExpanded}
          />
        ) : (
          <PlainPostContent
            post={post}
            onNavigate={onNavigate}
            forceExpanded={forceExpanded}
          />
        )}
      </div>
    </div>
  );
}
