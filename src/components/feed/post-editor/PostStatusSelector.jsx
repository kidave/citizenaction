"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export default function PostStatusSelector({ editor }) {

  const {
    type,
    status,
    setStatus
  } = editor;

  if (type === "meeting") return null;

  return (
    <Field>

      <FieldLabel>Status</FieldLabel>

      <Input
        placeholder="Current status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />

    </Field>
  );
}