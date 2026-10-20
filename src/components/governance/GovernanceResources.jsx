"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import PostAttachments from "@/components/post/PostAttachments";
import LinkCard from "@/components/post/LinkCard";
import { supabase } from "@/lib/supabase/client";
import { deleteGovernanceAttachments, uploadGovernanceAttachments } from "@/lib/supabase/storage";

export default function GovernanceResources({ governanceId, attachments = [], links = [], canEdit = false, onChanged }) {
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const hasAttachments = attachments.length > 0;
  const refresh = () => onChanged?.();

  const handleFiles = async (pickedFiles) => {
    const files = (pickedFiles || []).filter((item) => item?.file);
    if (!files.length || !governanceId) return;
    setUploading(true);
    try {
      const uploaded = await uploadGovernanceAttachments(governanceId, files.map((item) => ({
        file: item.file, attachmentId: item.id || crypto.randomUUID(),
      })));
      const rows = uploaded.map((item, index) => ({
        id: item.attachmentId, governance_id: governanceId,
        storage_path: item.storage_path, public_url: item.public_url,
        preview_url: item.preview_url || null, thumbnail_path: item.thumbnail_path || null,
        thumbnail_url: item.thumbnail_url || null, file_name: item.file_name,
        mime_type: item.mime_type, file_size: item.file_size, width: item.width,
        height: item.height, duration: item.duration, sort_order: attachments.length + index,
      }));
      const { error } = await supabase.from("attachment").insert(rows);
      if (error) { await deleteGovernanceAttachments(uploaded); throw error; }
      toast.success(`${files.length} attachment${files.length === 1 ? "" : "s"} added`);
      await refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to add attachment");
    } finally { setUploading(false); }
  };

  const handleRemove = async (index) => {
    const attachment = attachments[index];
    if (!attachment?.id || removingId) return;
    setRemovingId(attachment.id);
    try {
      const { error } = await supabase.from("attachment").delete()
        .eq("id", attachment.id).eq("governance_id", governanceId);
      if (error) throw error;
      try {
        await deleteGovernanceAttachments([attachment]);
      } catch {
        toast.error("Attachment removed from the profile, but its stored file could not be deleted.");
        await refresh();
        return;
      }
      toast.success("Attachment removed");
      await refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to remove attachment");
    } finally { setRemovingId(null); }
  };

  if (!hasAttachments && !links.length && !canEdit) return null;

  return (
    <section className="space-y-4" aria-label="Organization media and links">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Media and documents</h2>
          {(hasAttachments || links.length > 0) && <p className="mt-0.5 text-xs text-muted-foreground">Photos, documents and useful links</p>}
        </div>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-0.5">
            <ImagePicker accept="image/*,video/*" onUpload={handleFiles} disabled={uploading || Boolean(removingId)} />
            <DocumentPicker onUpload={handleFiles} disabled={uploading || Boolean(removingId)} />
            {uploading && <Loader2 className="ml-1 h-4 w-4 animate-spin text-muted-foreground" aria-label="Uploading attachments" />}
          </div>
        )}
      </div>
      {hasAttachments && <PostAttachments attachments={attachments} removable={canEdit} onRemove={handleRemove} />}
      {links.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Links</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => <LinkCard key={link.id || link.url} link={link} />)}
          </div>
        </div>
      )}
    </section>
  );
}
