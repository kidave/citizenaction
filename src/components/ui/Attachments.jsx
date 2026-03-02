"use client";

import { useState } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import AttachmentViewer from "@/components/ui/AttachmentViewer";
import { FileText, Paperclip } from "lucide-react";

export default function Attachments({ attachments = [] }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!attachments.length) return null;

  const images = attachments.filter((a) =>
    a.type?.startsWith("image/")
  );

  const files = attachments.filter(
    (a) => !a.type?.startsWith("image/")
  );

  return (
    <>
      {images.length > 0 && (
        <FocusCards
          images={images}
          onCardClick={(index) => {
            setActiveIndex(index);
            setViewerOpen(true);
          }}
        />
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => {
            const isPdf = file.type === "application/pdf";

            return (
              <div
                key={file.url || i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 hover:bg-muted text-xs cursor-pointer"
                onClick={() => {
                  setActiveIndex(
                    attachments.findIndex(
                      (a) => a.url === file.url
                    )
                  );
                  setViewerOpen(true);
                }}
              >
                {isPdf ? (
                  <FileText className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="truncate max-w-[140px] font-medium">
                  {file.name || `File ${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <AttachmentViewer
        attachments={attachments}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        activeIndex={activeIndex}
      />
    </>
  );
}