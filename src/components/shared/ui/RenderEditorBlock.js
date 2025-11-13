// components/shared/ui/RenderEditorBlock.js
import React from "react";

export default function RenderEditorBlock({ block, index }) {
  // Validate block structure
  if (!block || typeof block !== 'object') {
    console.warn('Invalid block:', block);
    return null;
  }

  try {
    switch (block.type) {
      case "paragraph":
        if (!block.data?.text) return null;
        return (
          <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />
        );

      case "header": {
        if (!block.data?.text || !block.data?.level) return null;
        const Tag = `h${block.data.level}`;
        return (
          <Tag
            key={index}
            dangerouslySetInnerHTML={{ __html: block.data.text }}
          />
        );
      }

      case "list": {
        const items = block.data?.items || [];
        if (items.length === 0) return null;
        
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
        const checklistItems = block.data?.items || [];
        if (checklistItems.length === 0) return null;
        
        return (
          <ul key={index} style={{ listStyle: "none", padding: 0 }}>
            {checklistItems.map((item, i) => (
              <li key={i}>
                <input type="checkbox" checked={!!item.checked} readOnly />{" "}
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </li>
            ))}
          </ul>
        );

      case "table":
        const tableContent = block.data?.content || [];
        if (tableContent.length === 0) return null;
        
        return (
          <table
            key={index}
            border="1"
            cellPadding="5"
            style={{ borderCollapse: "collapse", marginBottom: "1rem", width: '100%' }}
          >
            <tbody>
              {tableContent.map((row, rowIndex) => (
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
        if (!block.data?.file?.url) return null;
        return (
          <div key={index} style={{ margin: "20px 0" }}>
            <img
              src={block.data.file.url}
              alt={block.data.caption || ""}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            {block.data.caption && (
              <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
                {block.data.caption}
              </p>
            )}
          </div>
        );

      case "embed":
        if (!block.data?.embed) return null;
        return (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <iframe
              src={block.data.embed}
              width={block.data.width || "100%"}
              height={block.data.height || "400"}
              allowFullScreen
              style={{ maxWidth: '100%' }}
            />
            {block.data.caption && <p>{block.data.caption}</p>}
          </div>
        );

      default:
        console.warn(`Unsupported block type: ${block.type}`, block);
        return (
          <div key={index} style={{ 
            background: '#f0f0f0', 
            padding: '10px', 
            margin: '10px 0',
            borderLeft: '4px solid #ff6b6b'
          }}>
            <p style={{ margin: 0, color: '#666' }}>
              Unsupported content type: <strong>{block.type}</strong>
            </p>
          </div>
        );
    }
  } catch (error) {
    console.error('Error rendering block:', error, block);
    return (
      <div key={index} style={{ 
        background: '#ffe6e6', 
        padding: '10px', 
        margin: '10px 0',
        borderLeft: '4px solid #ff4757'
      }}>
        <p style={{ margin: 0, color: '#cc0000' }}>
          Error rendering content block
        </p>
      </div>
    );
  }
}