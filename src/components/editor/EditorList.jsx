"use client";

import EditorRichText from "./EditorRichText";

export default function EditorList({ items = [], style = "unordered" }) {
  const ListTag = style === "ordered" ? "ol" : "ul";

  return (
    <ListTag
      className={
        style === "ordered"
          ? "list-decimal space-y-1 pl-6"
          : "list-disc space-y-1 pl-6"
      }
    >
      {items.map((item, index) => {
        const content =
          typeof item === "string" ? item : item?.content || item?.text || "";

        const children = typeof item === "object" ? item?.items || [] : [];

        return (
          <li key={index}>
            <EditorRichText html={content} />

            {children.length > 0 && (
              <EditorList items={children} style={style} />
            )}
          </li>
        );
      })}
    </ListTag>
  );
}
