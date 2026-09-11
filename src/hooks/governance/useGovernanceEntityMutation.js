import { supabase } from "@/lib/supabase/client";
import { uploadGovernanceAttachments } from "@/lib/supabase/storage";

export function useGovernanceEntityMutation() {
  async function updateEntity({
    entity,
    draft,
    pendingAttachments,
    attachments,
    links,
  }) {
    const result = await supabase.rpc("update_governance_entity", {
      p_entity_id: entity.id,
      p_name: draft.name.trim(),
      p_short_name: draft.short_name.trim() || null,
      p_description: draft.description.trim() || null,
      p_website: draft.website.trim() || null,
      p_entity_type: draft.entity_type,
      p_status: draft.status,
      p_valid_from: `${draft.valid_from}T00:00:00Z`,
      p_valid_to: draft.valid_to
        ? `${draft.valid_to}T23:59:59.999Z`
        : null,
      p_image_url: draft.image_url || null,
      p_category_id: draft.category_id || null,
    });

    if (result.error) throw result.error;

    if (pendingAttachments?.length) {
      const uploaded = await uploadGovernanceAttachments(
        entity.id,
        pendingAttachments,
      );

      const rows = uploaded.map((item, index) => ({
        governance_id: entity.id,
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
        sort_order: (attachments?.length || 0) + index,
      }));

      const { error } = await supabase
        .from("attachment")
        .insert(rows);

      if (error) throw error;
    }

    const { error: deleteError } = await supabase
      .from("link")
      .delete()
      .eq("governance_id", entity.id);

    if (deleteError) throw deleteError;

    if (links?.length) {
      const rows = links.map((link, index) => ({
        governance_id: entity.id,
        url: link.url,
        type: link.type || "website",
        title: link.title || null,
        description: link.description || null,
        hostname: link.hostname || null,
        image_url: link.image_url || null,
        icon_url: link.icon_url || null,
        sort_order: index,
      }));

      const { error } = await supabase
        .from("link")
        .insert(rows);

      if (error) throw error;
    }

    return result.data;
  }

  async function deleteEntity(entityId) {
    const { error } = await supabase.rpc(
      "delete_governance_entity",
      { p_entity_id: entityId },
    );

    if (error) throw error;
  }

  return {
    updateEntity,
    deleteEntity,
  };
}
