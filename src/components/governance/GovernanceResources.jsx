"use client";

import { useRef, useState } from "react";
import { FilePlus2, Link2, Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PostAttachments from "@/components/post/PostAttachments";
import { supabase } from "@/lib/supabase/client";
import {
  deleteGovernanceAttachments,
  uploadGovernanceAttachments,
} from "@/lib/supabase/storage";

export default function GovernanceResources({
  governanceId,
  attachments = [],
  links = [],
  canEdit = false,
  onChanged,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  const hasResources = attachments.length > 0 || links.length > 0;
  const refresh = () => onChanged?.();

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !governanceId) return;

    setUploading(true);
    try {
      const attachmentIds = files.map(() => crypto.randomUUID());
      const uploaded = await uploadGovernanceAttachments(
        governanceId,
        files.map((file, index) => ({
          file,
          attachmentId: attachmentIds[index],
        })),
      );
      const rows = uploaded.map((item, index) => ({
        id: item.attachmentId,
        governance_id: governanceId,
        storage_path: item.storage_path,
        public_url: item.public_url,
        thumbnail_path: item.thumbnail_path || null,
        thumbnail_url: item.thumbnail_url || null,
        file_name: item.file_name,
        mime_type: item.mime_type,
        file_size: item.file_size,
        width: item.width,
        height: item.height,
        duration: item.duration,
        sort_order: attachments.length + index,
      }));

      const { error } = await supabase.from("attachment").insert(rows);
      if (error) {
        await deleteGovernanceAttachments(uploaded);
        throw error;
      }

      toast.success(
        `${files.length} resource${files.length === 1 ? "" : "s"} added`,
      );
      refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to add resource");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (index) => {
    const attachment = attachments[index];
    if (!attachment?.id) return;
    try {
      const { error } = await supabase.from("attachment").delete().eq("id", attachment.id).eq("governance_id", governanceId);
      if (error) throw error;
      try {
        await deleteGovernanceAttachments([attachment]);
      } catch {
        toast.error("Resource record removed, but its stored file could not be deleted.");
      }
      toast.success("Resource removed");
      refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to remove resource");
    }
  };

  const handleRemoveLink = async (link) => {
    if (!link?.id || !governanceId) return;
    try {
      const { error } = await supabase.from("link").delete().eq("id", link.id).eq("governance_id", governanceId);
      if (error) throw error;
      toast.success("Link removed");
      refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to remove link");
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

  if (!hasResources && !canEdit) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resources
          </p>
          {hasResources && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Documents, images and links
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              className="hidden"
              onChange={handleFiles}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-4 w-4" />
              )}
              Add files
            </Button>
          </div>
        )}
      </div>

      {hasResources && (
        <PostAttachments attachments={attachments} links={links} removable={canEdit} onRemove={handleRemoveAttachment} />
      )}

      {canEdit && links.length > 0 && (
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.id || link.url} className="flex min-w-0 items-center gap-2 text-sm">
              <a href={link.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-primary hover:underline">
                {link.title || link.url}
              </a>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemoveLink(link)} aria-label={"Remove link " + (link.title || link.url)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="Add a website or document link"
              className="pl-9"
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddLink();
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLink}
            disabled={addingLink || !linkUrl.trim()}
          >
            {addingLink ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="mr-1.5 h-4 w-4" />
            )}
            Add link
          </Button>
        </div>
      )}
    </section>
  );
}
