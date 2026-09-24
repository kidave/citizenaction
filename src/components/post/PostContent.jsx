"use client";

import Link from "next/link";
import Linkify from "linkify-react";

import truncateContent from "@/utils/text/truncateContent";

import EditorRenderer from "@/components/editor/EditorRenderer";

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

function PostTitle({ title }) {
  if (!title) return null;

  return (
    <div className="border-l-4 border-primary pl-4">
      <h2 className="font-serif text-xl leading-snug tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function ReadMore({ post }) {
  if (!post?.slug) return null;

  return (
    <Link
      href={`/post/${post.slug}`}
      className="ml-2 inline-flex items-center font-medium text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      Read more
    </Link>
  );
}

function PlainPostContent({ post, onNavigate, forceExpanded }) {
  const content = post.content || "";

  const { text: truncatedText, isLong } = truncateContent(content, 280);

  const displayContent = forceExpanded || !isLong ? content : truncatedText;

  return (
    <div className="whitespace-pre-wrap text-lg">
      <LinkifiedText>{displayContent}</LinkifiedText>

      {!forceExpanded && isLong && <ReadMore post={post} />}
    </div>
  );
}

function RichPostContent({ post, onNavigate, forceExpanded }) {
  const blocks = post.content_json?.blocks || [];

  if (!blocks.length) {
    return null;
  }

  if (forceExpanded) {
    return <EditorRenderer blocks={blocks} />;
  }

  const content = post.content || "";

  const { text: truncatedText, isLong } = truncateContent(content, 280);

  const displayContent = isLong ? truncatedText : content;

  return (
    <div className="whitespace-pre-wrap text-lg">
      <LinkifiedText>{displayContent}</LinkifiedText>

      {isLong && <ReadMore post={post} />}
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
      <div className="space-y-4">
        <PostTitle title={title} />

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
