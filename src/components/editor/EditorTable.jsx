"use client";

import EditorRichText from "./EditorRichText";

export default function EditorTable({ content = [] }) {
  if (!content.length) {
    return null;
  }

  return (
    <div className="my-4 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[480px] border-collapse text-lg">
        <tbody>
          {content.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex === 0 ? "bg-muted/60" : "bg-background"}
            >
              {(row || []).map((cell, cellIndex) => (
                <td key={cellIndex} className="border px-3 py-2 align-top">
                  <EditorRichText html={cell || ""} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
