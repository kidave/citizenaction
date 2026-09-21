"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ArrowLeft, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import EditorHeader from "@/components/feed/editor/EditorHeader";
import EditorFooter from "@/components/feed/editor/EditorFooter";
import EditorContextSuggestions from "@/components/feed/editor/EditorContextSuggestions";

const EditorContent = dynamic(
  () => import("@/components/feed/editor/EditorContent"),
  { ssr: false },
);

export default function DocumentPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const postSlug =
    typeof router.query.post === "string" ? router.query.post : null;
  const [post, setPost] = useState(null);
  const [postLoading, setPostLoading] = useState(Boolean(postSlug));

  useEffect(() => {
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
        setPost(Array.isArray(data) ? data[0] : data);
      }

      setPostLoading(false);
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [postSlug]);

  const editor = usePostEditor(post, null);

  const isLoading =
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

  function handleCreated(post) {
    if (post?.slug) {
      router.push("/post/" + post.slug);
      return;
    }

    handleClose();
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Back to feed"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Document</span>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          {post ? "Edit document" : "New document"}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <EditorHeader
          mode="post"
          profile={profile}
          editor={editor}
          spaces={spaces}
          showTitle={false}
        />

        <EditorContextSuggestions editor={editor} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 sm:px-8">
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
              showTitle
            />
          </div>
        </main>

        <EditorFooter
          mode="post"
          item={null}
          editor={editor}
          onClose={handleClose}
          onCreated={handleCreated}
          documentMode
        />
      </div>
    </div>
  );
}
