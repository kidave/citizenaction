"use client";

import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PostAttachments from "@/components/post/PostAttachments";
import { supabase } from "@/lib/supabase/client";
import {
  deleteGovernanceAttachments,
  uploadGovernanceAttachments,
} from "@/lib/supabase/storage";

export default function GovernanceResources({
  governanceId,
  title = "Media and documents",
  attachments = [],
  links = [],
  canEdit = false,
  onChanged,
}) {
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const hasResources = attachments.length > 0 || links.length > 0;
  const refresh = () => onChanged?.();

  const handleRemove = async (index) => {
    const attachment = attachments[index];
    if (!attachment?.id || !window.confirm(`Delete ${attachment.file_name || "this file"}? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from("attachment").delete().eq("id", attachment.id).eq("governance_id", governanceId);
      if (error) throw error;
      try {
        await deleteGovernanceAttachments([attachment]);
      } catch (storageError) {
        toast.error(`Record deleted, but the stored file could not be removed: ${storageError.message || "storage error"}`);
        refresh();
        return;
      }
      toast.success("Attachment deleted");
      refresh();
    } catch (error) {
      toast.error(error?.message || "Unable to delete attachment");
    }
  };

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
        preview_url: item.preview_url || null,
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


  if (!hasResources && !canEdit) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {canEdit && (
        <TooltipProvider>
          <div className="flex items-center justify-end gap-1">
            <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
            <input ref={documentInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden" onChange={handleFiles} />
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => imageInputRef.current?.click()} disabled={uploading} aria-label="Add images">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>Add images</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => documentInputRef.current?.click()} disabled={uploading} aria-label="Add documents"><FileText className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Add documents</TooltipContent></Tooltip>
          </div>
        </TooltipProvider>
        )}
      </div>

      {hasResources && (
        <PostAttachments attachments={attachments} links={links} removable={canEdit} onRemove={handleRemove} />
      )}

    </section>
  );
}
