"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";
import PostEditor from "./PostEditor";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import EditorAttachments from "./EditorAttachments";
import EditorContextSuggestions from "./EditorContextSuggestions";

const PlainTextEditor = dynamic(() => import("./content/PlainTextEditor"), { ssr: false });

export default function EditorModal({ isOpen, onClose, mode = "post", item = null, post = null, initialSpace = null }) {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const contributionEditor = useContributionEditor(mode === "contribution" ? item : null, post);
  const isDocumentPost = mode === "post" && !!item && item.content_format === "editorjs";

  useEffect(() => {
    if (isDocumentPost && item?.slug) {
      onClose?.();
      router.replace("/document?post=" + encodeURIComponent(item.slug));
    }
  }, [isDocumentPost, item?.slug]);

  if (isDocumentPost) return null;

  function handleClose() {
    if (mode === "contribution") contributionEditor.reset?.();
    onClose?.();
  }

  function handleCreated(savedPost) {
    handleClose();
    if (savedPost?.slug) router.push("/post/" + savedPost.slug);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex h-dvh max-h-dvh min-h-0 w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[80vh] sm:min-h-[320px] sm:max-w-2xl sm:rounded-xl">
        {mode === "post" ? (
          <PostEditor item={item} initialSpace={initialSpace} onClose={handleClose} onCreated={handleCreated} />
        ) : profileLoading || spacesLoading || !profile ? (
          <EditorModalSkeleton />
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <EditorHeader profile={profile} editor={contributionEditor} spaces={spaces} showTitle={false} showSelectors={false} />
            <EditorContextSuggestions editor={contributionEditor} />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <PlainTextEditor
                content={contributionEditor.content}
                setContent={contributionEditor.setContent}
                setContentJson={contributionEditor.setContentJson}
                setContentFormat={contributionEditor.setContentFormat}
              />
              <div className="mt-auto shrink-0">
                <EditorAttachments attachments={contributionEditor.attachments} setAttachments={contributionEditor.setAttachments} links={contributionEditor.links} />
              </div>
            </div>
            <EditorFooter
              editor={contributionEditor}
              item={item}
              onClose={handleClose}
              onCreated={handleCreated}
              showDocumentAction={false}
              showDateTime={false}
              showAddress={false}
              showDraftStatus={false}
              submitLabel={item ? "Update" : "Add"}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
