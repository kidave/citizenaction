"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { useContributionEditor } from "@/hooks/editor/useContributionEditor";
import EditorHeader from "./EditorHeader";
import EditorAttachments from "./EditorAttachments";
import EditorFooter from "./EditorFooter";
import EditorContextSuggestions from "./EditorContextSuggestions";

const EditorContent = dynamic(() => import("./EditorContent"), {
  ssr: false,
});

export default function EditorModal({
  isOpen,
  onClose,
  mode = "post",
  item = null,
  post = null,
  initialSpace = null,
}) {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const loading = profileLoading || spacesLoading;
  const router = useRouter();

  const postEditor = usePostEditor(mode === "post" ? item : null, initialSpace);
  const contributionEditor = useContributionEditor(
    mode === "contribution" ? item : null,
    post,
  );
  const editor = mode === "post" ? postEditor : contributionEditor;

  function handleClose() {
    if (mode === "post" && !item) {
      editor.reset?.();
    }
    onClose?.();
  }

  function handleCreated(savedPost) {
    handleClose();

    if (savedPost?.slug) {
      router.push("/post/" + savedPost.slug);
    }
  }

  const isNewPost = mode === "post" && !item;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={
          isNewPost
            ? "flex max-h-[80vh] min-h-[320px] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-2xl sm:rounded-xl"
            : "flex h-full max-h-[90vh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:max-w-4xl sm:rounded-xl"
        }
      >
        {loading ? (
          <EditorModalSkeleton />
        ) : (
          <>
            <EditorHeader
              mode={mode}
              profile={profile}
              editor={editor}
              spaces={spaces}
            />

            {mode === "post" && <EditorContextSuggestions editor={editor} />}

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <EditorContent
                title={editor.title}
                setTitle={editor.setTitle}
                content={editor.content}
                setContent={editor.setContent}
                contentJson={editor.contentJson}
                setContentJson={editor.setContentJson}
                contentFormat={editor.contentFormat}
                setContentFormat={editor.setContentFormat}
                attachments={editor.attachments}
                addAttachments={editor.addAttachments}
                documentMode={false}
                showTitle={Boolean(item)}
              />

              <div className="mt-auto shrink-0">
                <EditorAttachments
                  attachments={editor.attachments}
                  setAttachments={editor.setAttachments}
                  links={editor.links}
                />
              </div>
            </div>

            <EditorFooter
              mode={mode}
              item={item}
              editor={editor}
              onClose={handleClose}
              onCreated={handleCreated}
              onDocumentMode={
                isNewPost
                  ? () => {
                      handleClose();
                      router.push("/action");
                    }
                  : undefined
              }
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
