"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { supabase } from "@/lib/supabase/client";

import Topbar from "@/components/navigation/Topbar";
import EditorHeader from "@/components/feed/editor/EditorHeader";
import EditorFooter from "@/components/feed/editor/EditorFooter";
import EditorContextSuggestions from "@/components/feed/editor/EditorContextSuggestions";
import DocumentPreview from "@/components/feed/editor/DocumentPreview";

const EditorContent = dynamic(
  () => import("@/components/feed/editor/EditorContent"),
  { ssr: false },
);

export default function DocumentPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();

  const routerReady = router.isReady;
  const postSlug =
    typeof router.query.post === "string" ? router.query.post : null;

  const [post, setPost] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    if (!routerReady) return;

    if (!postSlug) {
      setPost(null);
      setPostLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPost() {
      setPostLoading(true);

      const { data, error } = await supabase.rpc("get_post_by_slug", {
        p_slug: postSlug,
      });

      if (cancelled) return;

      if (error) {
        console.error("Failed to load document post:", error);
        setPost(null);
      } else {
        const loadedPost = Array.isArray(data) ? data[0] : data;
        setPost(loadedPost || null);
      }

      setPostLoading(false);
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [routerReady, postSlug]);

  const editor = usePostEditor(post, null, {
    draftScope: "document",
  });

  const isLoading =
    !routerReady ||
    loading ||
    profileLoading ||
    spacesLoading ||
    postLoading ||
    !profile ||
    !user;

  if (isLoading) {
    return <div className="min-h-dvh bg-background" />;
  }

  function handleClose() {
    const returnTo = localStorage.getItem("returnTo");

    if (returnTo) {
      localStorage.removeItem("returnTo");
      router.replace(returnTo);
      return;
    }

    router.replace("/");
  }

  function handleCreated(savedPost) {
    if (savedPost?.slug) {
      router.push("/post/" + savedPost.slug);
      return;
    }

    handleClose();
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <Topbar
        items={[{ label: "Document" }]}
        title="Document"
        showHome={false}
        backHref="/"
        actions={
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col">
            <EditorHeader
              mode="post"
              profile={profile}
              editor={editor}
              spaces={spaces}
              showTitle
              documentMode
            />

            <EditorContextSuggestions editor={editor} />

            <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
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
              documentMode
              showTitle={false}
            />
            </div>
          </div>
        </main>

        <DocumentPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={editor.title}
          contentJson={editor.contentJson}
          profile={profile}
          spaces={editor.spaces}
          governance={editor.governance}
        />

        <EditorFooter
          mode="post"
          item={post}
          editor={editor}
          onClose={handleClose}
          onCreated={handleCreated}
          documentMode
        />
      </div>
    </div>
  );
}
