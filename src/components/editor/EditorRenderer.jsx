"use client";

import EditorBlock from "./EditorBlock";

export default function EditorRenderer({
  blocks = [],
  className = "mx-auto w-full max-w-3xl space-y-4 text-lg",
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
