"use client";

import { Check, FileText } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LinkManager from "@/components/link/LinkManager";
import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";

export default function EditorFooter({
  editor,
  item = null,
  onClose,
  onCreated,
  showDocumentAction = false,
  onDocumentMode,
  showAttachments = true,
  showDateTime = true,
  showAddress = true,
  showDraftStatus = true,
  submitLabel,
  maxWidthClass = "max-w-6xl",
}) {
  const router = useRouter();

  const handleSuccess = (post) => {
    if (onCreated) {
      onCreated(post);
      return;
    }
    onClose?.();
    if (!item && post?.slug) router.push("/post/" + post.slug);
  };

  const label = submitLabel || (item ? "Update" : "Post");

  return (
    <TooltipProvider>
      <div className={`mx-auto w-full ${maxWidthClass} shrink-0 bg-background/95 px-4 py-2.5 backdrop-blur sm:px-6`}>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-0.5">
            {showDocumentAction && onDocumentMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onDocumentMode} aria-label="Open document editor">
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Document editor</TooltipContent>
              </Tooltip>
            )}

            {showAttachments && (
              <>
                <ImagePicker onUpload={(files) => editor.setAttachments((prev) => [...prev, ...files])} />
                <DocumentPicker onUpload={(files) => editor.setAttachments((prev) => [...prev, ...files])} />
                <LinkManager value={editor.links} onChange={editor.setLinks} />
              </>
            )}

            {showDateTime && <EditorDateTime editor={editor} />}
            {showAddress && <EditorAddress editor={editor} />}
          </div>

          <div className="flex items-center gap-3">
            {showDraftStatus && editor.draftStatus === "saved" && (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Check className="h-3.5 w-3.5" />
                Draft saved
              </span>
            )}
            {editor.draftStatus === "saving" && (
              <span className="hidden text-xs text-muted-foreground sm:flex">Saving draft…</span>
            )}
            <Button type="button" onClick={() => editor.submit(handleSuccess)} className="shrink-0">
              {label}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
