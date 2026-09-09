"use client";

import { useRef, useState } from "react";
import { FilePlus2, Link2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PostAttachments from "@/components/feed/post/PostAttachments";
import { supabase } from "@/lib/supabase/client";
import { uploadGovernanceAttachments } from "@/lib/supabase/storage";

export default function GovernanceResources({ governanceId, attachments = [], links = [], canEdit = false, onChanged }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  const refresh = () => onChanged?.();

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !governanceId) return;

    setUploading(true);
    try {
      const uploaded = await uploadGovernanceAttachments(governanceId, files);
      const rows = uploaded.map((item) => ({
        governance_id: governanceId,
        storage_path: item.storage_path,
        public_url: item.public_url,
        preview_url: item.preview_url || null,
        thumbnail_path: item.thumbnail_path || null,
        thumbnail_url: item.thumbnail_url || null,
        file_name: item.file_name,
        mime_type: item.mime_type,
        file_size: item.file_size,
        width: item.width,
        height: item.height,
        duration: item.duration,
        sort_order: attachments.length,
      }));

      const { error } = await supabase.from("attachment").insert(rows);
      if (error) throw error;

      toast.success(`${files.length} resource${files.length === 1 ? "" : "s"} added`);
      refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to add resource");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = async () => {
    const url = linkUrl.trim();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid URL");
      return;
    }

    setAddingLink(true);
    try {
      const { error } = await supabase.from("link").insert({
        governance_id: governanceId,
        url,
        title: url,
        sort_order: links.length,
      });
      if (error) throw error;

      setLinkUrl("");
      toast.success("Link added");
      refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to add link");
    } finally {
      setAddingLink(false);
    }
  };

  const hasResources = attachments.length > 0 || links.length > 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resources</p>
          {hasResources && <p className="mt-0.5 text-xs text-muted-foreground">Documents, images and links</p>}
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden" onChange={handleFiles} />
            <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
              Add files
            </Button>
          </div>
        )}
      </div>

      {hasResources ? (
        <PostAttachments attachments={attachments} links={links} />
      ) : (
        <div className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
          No documents, images or links added yet.
        </div>
      )}

      {canEdit && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="Add a website or document link" className="pl-9" onKeyDown={(event) => { if (event.key === "Enter") handleAddLink(); }} />
          </div>
          <Button type="button" variant="outline" onClick={handleAddLink} disabled={addingLink || !linkUrl.trim()}>
            {addingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-1.5 h-4 w-4" />}
            Add link
          </Button>
        </div>
      )}
    </section>
  );
}
