"use client";

import { useState } from "react";
import { Monitor, Smartphone, X as CloseIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import EditorRenderer from "@/components/editor/EditorRenderer";

function getAuthorName(profile) {
  return profile?.display_name || profile?.full_name || profile?.name || "You";
}

export default function DocumentPreview({ open, onOpenChange, title, contentJson, profile }) {
  const [viewport, setViewport] = useState("desktop");
  const blocks = contentJson?.blocks || [];
  const authorName = getAuthorName(profile);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] max-h-[92dvh] w-[96vw] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5">
          <DialogTitle className="text-sm font-medium">Preview</DialogTitle>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button type="button" variant={viewport === "desktop" ? "secondary" : "ghost"} size="sm" className="h-8 gap-1.5" onClick={() => setViewport("desktop")}>
              <Monitor className="h-3.5 w-3.5" /><span className="hidden sm:inline">Desktop</span>
            </Button>
            <Button type="button" variant={viewport === "mobile" ? "secondary" : "ghost"} size="sm" className="h-8 gap-1.5" onClick={() => setViewport("mobile")}>
              <Smartphone className="h-3.5 w-3.5" /><span className="hidden sm:inline">Mobile</span>
            </Button>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange?.(false)} aria-label="Close preview">
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-4 sm:p-8">
          {viewport === "mobile" ? (
            <div className="mx-auto flex h-full max-w-[390px] items-start justify-center">
              <article className="flex h-full max-h-[780px] w-full flex-col overflow-y-auto rounded-[2rem] border bg-background shadow-xl">
                <div className="px-5 pb-10 pt-8">
                  <div className="mb-6 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                      <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="truncate text-sm font-medium">{authorName}</p>
                  </div>
                  <h1 className="mb-7 font-serif text-2xl font-semibold leading-tight tracking-tight">{title || "Untitled document"}</h1>
                  {blocks.length ? <EditorRenderer blocks={blocks} className="space-y-5 text-base leading-7" /> : <p className="text-sm text-muted-foreground">Start writing to preview your document.</p>}
                </div>
              </article>
            </div>
          ) : (
            <article className="mx-auto min-h-full w-full max-w-3xl bg-background px-6 py-12 shadow-sm sm:px-12 sm:py-16">
              <div className="mb-8 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="" />
                  <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="font-medium">{authorName}</p>
              </div>
              <h1 className="mb-10 font-serif text-4xl font-semibold leading-tight tracking-tight">{title || "Untitled document"}</h1>
              {blocks.length ? <EditorRenderer blocks={blocks} className="space-y-6 text-lg leading-8" /> : <p className="text-muted-foreground">Start writing to preview your document.</p>}
            </article>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
