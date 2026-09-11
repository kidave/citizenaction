import { useEffect, useState } from "react";
import { toGovernanceDateInput } from "@/utils/governance";

function createDraft(entity) {
  return {
    name: entity?.name || "",
    short_name: entity?.short_name || "",
    description: entity?.description || "",
    website: entity?.website || "",
    entity_type: entity?.entity_type || "authority",
    status: entity?.status || "active",
    valid_from: toGovernanceDateInput(entity?.valid_from),
    valid_to: toGovernanceDateInput(entity?.valid_to),
    image_url: entity?.image_url || null,
    category_id: entity?.category_id || "",
  };
}

export function useGovernanceEntityForm(entity) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [pendingAttachments, setPendingAttachments] = useState([]);

  useEffect(() => {
    if (!entity) {
      setDraft(null);
      setEditing(false);
      setPendingAttachments([]);
      return;
    }

    setDraft(createDraft(entity));
  }, [entity]);

  function startEditing() {
    setDraft(createDraft(entity));
    setPendingAttachments([]);
    setEditing(true);
  }

  function updateDraft(key, value) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function closeEditing() {
    setEditing(false);
    setDraft(createDraft(entity));
    setPendingAttachments([]);
  }

  function validate(requiresValidTo) {
    if (!draft?.name?.trim()) {
      return "Name is required";
    }

    if (!draft.valid_from) {
      return "Valid from is required";
    }

    if (draft.valid_to && draft.valid_to < draft.valid_from) {
      return "Valid to cannot be earlier than valid from";
    }

    if (requiresValidTo && !draft.valid_to) {
      return "Add the date this entity became inactive";
    }

    return null;
  }

  return {
    editing,
    draft,
    pendingAttachments,

    setEditing,
    setPendingAttachments,

    startEditing,
    updateDraft,
    closeEditing,
    validate,
  };
}
