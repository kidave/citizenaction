"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
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
    <div className="bg-background/95 px-2 py-2 backdrop-blur sm:px-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          {isPost && !item && onDocumentMode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 shrink-0 px-2 sm:h-8 sm:px-3"
              onClick={onDocumentMode}
              aria-label="Open document editor"
              title="Open document editor"
            >
              <FileText className="h-5 w-5" />
              <span className="hidden sm:inline">Document</span>
            </Button>
          )}

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

          {isPost && <EditorDateTime editor={editor} />}
          {isPost && <EditorAddress editor={editor} />}

          <LinkManager value={editor.links} onChange={editor.setLinks} />
        </div>

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
  );
}
