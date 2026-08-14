"use client";

import EditorRichText from "./EditorRichText";
import EditorList from "./EditorList";
import EditorTable from "./EditorTable";
import EditorImage from "./EditorImage";
import EditorWarning from "./EditorWarning";
import EditorEmbed from "./EditorEmbed";

export default function EditorBlock({ block }) {
  const data = block?.data || {};

  switch (block?.type) {
    case "paragraph":
      return (
        <div className="leading-7">
          <EditorRichText html={data.text || ""} />
        </div>
      );

    case "header": {
      const level = Math.min(Math.max(Number(data.level) || 2, 1), 3);

      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";

      const className =
        level === 1
          ? "text-2xl font-semibold tracking-tight"
          : level === 2
            ? "text-xl font-semibold tracking-tight"
            : "text-lg font-semibold";

      return (
        <Tag className={className}>
          <EditorRichText html={data.text || ""} />
        </Tag>
      );
    }

    case "list":
      return (
        <EditorList
          items={data.items || []}
          style={data.style || "unordered"}
        />
      );

    case "table":
      return <EditorTable content={data.content || []} />;

    case "image":
      return <EditorImage data={data} />;

    case "warning":
      return <EditorWarning data={data} />;

    case "embed":
      return <EditorEmbed data={data} />;

    default:
      return null;
  }
}
