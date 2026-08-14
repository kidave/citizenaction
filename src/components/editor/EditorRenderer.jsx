"use client";

import EditorBlock from "./EditorBlock";

export default function EditorRenderer({
  blocks = [],
  className = "space-y-4 text-sm",
}) {
  if (!blocks.length) {
    return null;
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <EditorBlock key={block.id || index} block={block} />
      ))}
    </div>
  );
}
