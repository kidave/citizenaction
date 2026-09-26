"use client";

import EditorRichText from "./EditorRichText";

export default function EditorWarning({ data }) {
  return (
    <div className="my-4 rounded-xl border bg-muted/50 p-4">
      {data?.title && (
        <div className="font-sans font-medium">
          <EditorRichText html={data.title} />
        </div>
      )}

      {data?.message && (
        <div className="mt-1 font-sans text-lg leading-7 text-muted-foreground">
          <EditorRichText html={data.message} />
        </div>
      )}
    </div>
  );
}
