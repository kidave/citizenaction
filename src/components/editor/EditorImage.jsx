"use client";

import EditorRichText from "./EditorRichText";

export default function EditorImage({ data }) {
  if (!data?.file?.url) {
    return null;
  }

  return (
    <figure className="my-4 overflow-hidden rounded-2xl">
      <img
        src={data.file.url}
        alt={data.caption || ""}
        className={
          data.stretched ? "h-auto w-full" : "mx-auto h-auto max-w-full"
        }
      />

      {data.caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          <EditorRichText html={data.caption} />
        </figcaption>
      )}
    </figure>
  );
}
