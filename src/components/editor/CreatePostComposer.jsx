"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useSpaces } from "@/hooks/space/useSpaces";
import { usePostEditor } from "@/hooks/editor/usePostEditor";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/LoginModal";
import EditorFooter from "./EditorFooter";
import EditorAttachments from "./EditorAttachments";
import EditorHeader from "./EditorHeader";
import EditorContextSuggestions from "./EditorContextSuggestions";

const EditorContent = dynamic(() => import("./EditorContent"), { ssr: false });

export default function CreatePostComposer() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const editor = usePostEditor(null, null);
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [active, setActive] = useState(false);

  if (!user) {
    return (
      <>
        <Card className="mx-4 my-3 overflow-hidden rounded-2xl border bg-muted/50">
          <button type="button" onClick={() => setLoginOpen(true)} className="flex w-full items-center gap-3 p-4 text-left">
            <Avatar className="h-10 w-10 border-2">
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Login or Signup to document your action</span>
            <span className="ml-auto text-xl">+</span>
          </button>
        </Card>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} message="You need to be signed in to add something" />
      </>
    );
  }

  return (
    <Card className="mx-4 my-3 overflow-hidden rounded-2xl">
      {!active ? (
        <button type="button" onClick={() => setActive(true)} className="flex w-full items-center gap-3 p-4 text-left">
          <Link href={`/user/${profile?.username}`} onClick={(event) => event.stopPropagation()}>
            <Avatar className="h-10 w-10 border-2">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <span className="text-sm text-muted-foreground">Document your action</span>
          <span className="ml-auto text-xl">+</span>
        </button>
      ) : (
        <>
          <div className="border-b p-3 sm:p-4">
            <EditorHeader mode="post" profile={profile} editor={editor} spaces={spaces} />
            <EditorContextSuggestions editor={editor} />
          </div>

          <div className="flex min-h-0 flex-col">
            <EditorContent
              title={editor.title}
              setTitle={editor.setTitle}
              content={editor.content}
              setContent={editor.setContent}
              contentJson={editor.contentJson}
              setContentJson={editor.setContentJson}
              setContentFormat={editor.setContentFormat}
              attachments={editor.attachments}
              addAttachments={editor.addAttachments}
            />
            <EditorAttachments
              attachments={editor.attachments}
              setAttachments={editor.setAttachments}
              links={editor.links}
            />
          </div>

          <div className="border-t">
            <EditorFooter
              mode="post"
              item={null}
              editor={editor}
              onClose={() => {
                editor.reset?.();
                setActive(false);
              }}
              onCreated={(post) => {
                editor.reset?.();
                setActive(false);
                if (post?.slug) router.push(`/post/${post.slug}`);
              }}
            />
          </div>
        </>
      )}
    </Card>
  );
}
