"use client";

import { Check, FileText } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LinkManager from "@/components/feed/editor/LinkManager";
import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";

import EditorDateTime from "./EditorDateTime";
import EditorAddress from "./EditorAddress";

export default function EditorFooter({
  mode,
  item,
  editor,
  onClose,
  onCreated,
  onDocumentMode,
  documentMode = false,
}) {
  const router = useRouter();
  const isPost = mode === "post";

  const handleSuccess = (post) => {
    if (onCreated) {
      onCreated(post);
      return;
    }

    onClose?.();

    if (isPost && !item && post?.slug) {
      router.push("/post/" + post.slug);
    }
  };

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-6xl bg-background/95 px-4 py-2.5 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-0.5">
            {isPost && !item && onDocumentMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={onDocumentMode}
                    aria-label="Open document editor"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Document editor</TooltipContent>
              </Tooltip>
            )}

            {!documentMode && (
              <>
                <ImagePicker
                  onUpload={(files) =>
                    editor.setAttachments((prev) => [...prev, ...files])
                  }
                />

                <DocumentPicker
                  onUpload={(files) =>
                    editor.setAttachments((prev) => [...prev, ...files])
                  }
                />

                <LinkManager
                  value={editor.links}
                  onChange={editor.setLinks}
                />
              </>
            )}

            {isPost && <EditorDateTime editor={editor} />}
            {isPost && <EditorAddress editor={editor} />}
          </div>

          <div className="flex items-center gap-3">
            {isPost && !item && editor.draftStatus === "saved" && (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Check className="h-3.5 w-3.5" />
                Draft saved
              </span>
            )}

            <Button
              type="button"
              onClick={() => editor.submit(handleSuccess)}
              className="shrink-0"
            >
              {mode === "post"
                ? item
                  ? "Update"
                  : "Post"
                : item
                  ? "Update"
                  : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
