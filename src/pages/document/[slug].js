import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { usePost } from "@/hooks/feed/usePost";
import { usePostPublicContext } from "@/hooks/feed/usePostPublicContext";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import { useAuth } from "@/context/AuthContext";
import DocumentHeader from "@/components/document/DocumentHeader";
import PostContent from "@/components/post/PostContent";
import PostMetadata from "@/components/post/PostMetadata";
import PostTimeline from "@/components/post/PostTimeline";
import PostContribution from "@/components/contribution/PostContribution";
import PageHeader from "@/components/layout/PageHeader";

const EditorModal = dynamic(() => import("@/components/editor/EditorModal"), { ssr: false });

export async function getServerSideProps({ params }) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("get_post_by_slug", { p_slug: params.slug });
  if (error) return { notFound: true };
  const post = Array.isArray(data) ? data[0] : data;
  if (!post || post.content_format !== "editorjs") return { notFound: true };
  const { data: publicContext } = await supabase.rpc("get_post_public_context", { p_post_id: post.id });
  return { props: { initialPost: post, postId: post.id, initialContext: publicContext || { categories: [], geography: [] } } };
}

function cleanText(text) { return String(text || "").replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim(); }
function getDescription(post) { const text = cleanText(post.content); return text ? (text.length > 160 ? `${text.slice(0, 160)}...` : text) : "Citizen Action document"; }

export default function DocumentSlugPage({ postId, initialPost, initialContext }) {
  const router = useRouter();
  const { user } = useAuth();
  const { deletePost } = useDeletePost();
  const [editingPost, setEditingPost] = useState(null);
  const { data: post, isLoading, isError } = usePost(postId, initialPost);
  const { data: publicContext } = usePostPublicContext(postId, initialContext);
  if (isLoading || !post) return <div className="min-h-dvh bg-background" />;
  if (isError) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">Unable to load this document.</div>;

  const title = post.title || "Citizen Action Document";
  const description = getDescription(post);
  const url = `https://citizenaction.in/document/${post.slug}`;
  const canEdit = Boolean(user && (post.permissions?.can_manage || post.author_id === user.id));

  return <>
    <Head><title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={url} /><meta property="og:type" content="article" /><meta property="og:site_name" content="Citizen Action" /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={url} /></Head>
    <div className="min-h-dvh w-full bg-background">
      <PageHeader items={[{ label: "Home", href: "/" }, { label: "Documents", href: "/" }]} title="Document" />
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-8">
        <DocumentHeader post={post} publicContext={publicContext} canEdit={canEdit} onEdit={() => setEditingPost(post)} onDelete={async () => { await deletePost(post.id); router.push("/"); }} />
        <article className="mt-8 bg-transparent">
          <PostContent post={post} forceExpanded onNavigate={() => {}} />
          <PostMetadata post={post} forceExpanded />
          <PostTimeline post={post} />
        </article>
        <div className="mt-8"><PostContribution post={post} queryKey={["document", post.id]} /></div>
      </main>
      {editingPost && <EditorModal mode="post" isOpen onClose={() => setEditingPost(null)} item={editingPost} />}
    </div>
  </>;
}
