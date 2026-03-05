"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export default function PostLocationSelector({ editor }) {

  const {
    location,
    setLocation
  } = editor;

  return (
    <Field>

      <FieldLabel>Location</FieldLabel>

      <Input
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

    </Field>
  );
}