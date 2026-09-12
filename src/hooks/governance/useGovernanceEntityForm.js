import { useEffect, useState } from "react";
import { toGovernanceDateInput } from "@/utils/governance";

function createDraft(entity) {
  return {
    name: entity?.name || "",
    short_name: entity?.short_name || "",
    description: entity?.description || "",
    website: entity?.website || "",
    type: entity?.type || "government",
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

  useEffect(() => {
    if (!entity) {
      setDraft(null);
      setEditing(false);
      return;
    }

    setDraft(createDraft(entity));
  }, [entity]);

  function startEditing() {
    setDraft(createDraft(entity));
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
  }

  function validate(requiresValidTo) {
    if (!draft?.name?.trim()) return "Name is required";
    if (!draft.type) return "Type is required";
    if (!draft.valid_from) return "Valid from is required";

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
    setEditing,
    startEditing,
    updateDraft,
    closeEditing,
    validate,
  };
}
