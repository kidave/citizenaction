"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ArrowLeft, FileText, Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";
import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import AppShell from "@/components/layout/AppShell";
import EditorHeader from "@/components/feed/editor/EditorHeader";
import EditorFooter from "@/components/feed/editor/EditorFooter";
import EditorContextSuggestions from "@/components/feed/editor/EditorContextSuggestions";

const EditorContent = dynamic(
  () => import("@/components/feed/editor/EditorContent"),
  { ssr: false },
);

function DocumentTopBar({ post }) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  function handleBack() {
    const returnTo = localStorage.getItem("returnTo");

    if (returnTo) {
      localStorage.removeItem("returnTo");
      router.replace(returnTo);
      return;
    }

    router.replace("/");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">Document</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            · {post ? "Edit document" : "New document"}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Open navigation"
        className="shrink-0"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}

function DocumentWorkspace({ post, profile, spaces, editor }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <EditorHeader
        mode="post"
        profile={profile}
        editor={editor}
        spaces={spaces}
        showTitle={false}
      />

      <EditorContextSuggestions editor={editor} />

      <main className="min-h-0 flex-1 overflow-hidden px-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
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
        item={post}
        editor={editor}
        onClose={() => {}}
        onCreated={(savedPost) => {
          if (savedPost?.slug) {
            window.location.href = "/post/" + savedPost.slug;
          }
        }}
        documentMode
      />
    </div>
  );
}

export default function DocumentPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();

  const routerReady = router.isReady;
  const postSlug =
    typeof router.query.post === "string" ? router.query.post : null;

  const [post, setPost] = useState(null);
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

  const editor = usePostEditor(post, null);

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

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-background"
      data-document-editor
    >
      <DocumentTopBar post={post} />

      <DocumentWorkspace
        post={post}
        profile={profile}
        spaces={spaces}
        editor={editor}
      />
    </div>
  );
}

DocumentPage.getLayout = (page) => <AppShell>{page}</AppShell>;
