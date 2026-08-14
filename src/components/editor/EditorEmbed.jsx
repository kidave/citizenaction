"use client";

export default function EditorEmbed({ data }) {
  if (!data?.embed) {
    return null;
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border">
      <iframe
        src={data.embed}
        title={data.caption || "Embedded content"}
        className="aspect-video w-full"
        loading="lazy"
        allowFullScreen
      />

      {data.caption && (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          {data.caption}
        </div>
      )}
    </div>
  );
}
