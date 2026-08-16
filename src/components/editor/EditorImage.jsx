"use client";

import EditorRichText from "./EditorRichText";

export default function EditorImage({ data }) {
  if (!data?.file?.url) {
    return null;
  }

  const isStretched = data.stretched;

  return (
    <figure
      className={[
        "my-6",
        "overflow-hidden rounded-2xl",
        isStretched ? "w-full" : "mx-auto w-full max-w-[720px]",
      ].join(" ")}
    >
      <img
        src={data.file.url}
        alt={data.caption || ""}
        className={[
          "block h-auto w-full",
          "object-contain",
          data.withBorder ? "border border-border" : "",
          data.withBackground ? "bg-muted p-4" : "",
        ].join(" ")}
      />

      {data.caption && (
        <figcaption className="mt-2 px-2 text-center text-xs leading-relaxed text-muted-foreground">
          <EditorRichText html={data.caption} />
        </figcaption>
      )}
    </figure>
  );
}
