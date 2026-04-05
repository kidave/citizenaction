"use client";

import { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import ScopeSelector from "@/components/shared/ScopeSelector";
import { Input } from "@/components/ui/input";

export default function PostLocationSelector({ editor }) {
  const {
    scope_type,
    scope_code,
    setScopeType,
    setScopeCode,
    location,
    setLocation
  } = editor;

  const [open, setOpen] = useState(false);

  return (
    <Field>
      <FieldLabel>Location</FieldLabel>

      <div className="space-y-2">

        {/* SELECT BUTTON */}
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
        >
          {scope_code ? "Change Location" : "Select Location"}
        </Button>

        {/* DISPLAY */}
        {(scope_code || location) && (
          <div className="text-xs text-muted-foreground">
            {scope_code && <span>{scope_code}</span>}
            {scope_code && location && <span> • </span>}
            {location && <span>{location}</span>}
          </div>
        )}

      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">

          <div className="bg-background p-4 rounded-md w-full max-w-md space-y-4">

            <h3 className="text-sm font-medium">
              Select Location
            </h3>

            <ScopeSelector
              value={{ scope_type, scope_code }}
              onChange={({ scope_type, scope_code }) => {
                setScopeType(scope_type);
                setScopeCode(scope_code);
              }}
            />

            <Input
              placeholder="Optional: exact place (e.g. near metro gate 2)"
              value={location || ""}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button onClick={() => setOpen(false)}>
                Save
              </Button>
            </div>

          </div>

        </div>
      )}
    </Field>
  );
}