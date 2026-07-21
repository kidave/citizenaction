"use client";

import EditorType from "@/components/feed/editor/EditorType";
import { CONTRIBUTION_TYPES } from "@/components/feed/contribution/contributionTypes";

export default function ContributionTypeSelector({ value, onChange }) {
  return (
    <EditorType
      value={value}
      onChange={onChange}
      options={CONTRIBUTION_TYPES}
    />
  );
}
