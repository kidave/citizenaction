"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { supabase } from "@/lib/supabase/client";
import Topbar from "@/components/layout/Topbar";
import DocumentEditor from "@/components/editor/DocumentEditor";

export default function DocumentPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const routerReady = router.isReady;
  const postSlug = typeof router.query.post === "string" ? router.query.post : null;
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
      const { data, error } = await supabase.rpc("get_post_by_slug", { p_slug: postSlug });
      if (cancelled) return;
      if (error) {
        if (process.env.NODE_ENV !== "production") console.error("Failed to load document post:", error);
        setPost(null);
      } else {
        setPost(Array.isArray(data) ? data[0] || null : data || null);
      }
      setPostLoading(false);
    }
    loadPost();
    return () => { cancelled = true; };
  }, [routerReady, postSlug]);

  const isLoading = !routerReady || loading || profileLoading || spacesLoading || postLoading || !profile || !user;

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

  if (isLoading) return <div className="min-h-dvh bg-background" />;

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
      <div className="min-h-0 flex-1 overflow-hidden px-4 sm:px-8">
        <DocumentEditor
          profile={profile}
          spaces={spaces}
          post={post}
          previewOpen={previewOpen}
          onPreviewOpenChange={setPreviewOpen}
          onClose={handleClose}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
}
