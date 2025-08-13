// components/RenderEditorBlock.js
import React from "react";

export default function RenderEditorBlock({ block, index }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />
      );

    case "header": {
      const Tag = `h${block.data.level}`;
      return (
        <Tag
          key={index}
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );
    }

    case "list": {
      const items = block.data.items || [];
      const isOrdered = block.data.style === "ordered";
      const Tag = isOrdered ? "ol" : "ul";

      return (
        <Tag key={index}>
          {items.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{
                __html:
                  typeof item === "string"
                    ? item
                    : item.text || item.content || "",
              }}
            />
          ))}
        </Tag>
      );
    }

    case "checklist":
      return (
        <ul key={index} style={{ listStyle: "none", padding: 0 }}>
          {block.data.items.map((item, i) => (
            <li key={i}>
              <input type="checkbox" checked={item.checked} readOnly />{" "}
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <table
          key={index}
          border="1"
          cellPadding="5"
          style={{ borderCollapse: "collapse", marginBottom: "1rem" }}
        >
          <tbody>
            {block.data.content.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    dangerouslySetInnerHTML={{ __html: cell }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "image":
      return (
        <div key={index} style={{ margin: "20px 0" }}>
          <img
            src={block.data.file?.url}
            alt={block.data.caption || ""}
            style={{ maxWidth: "100%", height: "auto" }}
          />
          {block.data.caption && (
            <p
              style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}
            >
              {block.data.caption}
            </p>
          )}
        </div>
      );

    case "embed":
      return (
        <div key={index} style={{ marginBottom: "1rem" }}>
          <iframe
            src={block.data.embed}
            width={block.data.width}
            height={block.data.height}
            allowFullScreen
          />
          {block.data.caption && <p>{block.data.caption}</p>}
        </div>
      );

    default:
      return null;
  }
}
