"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SpaceSelector({
  value,
  onChange,
  spaces = [],
  disabled = false,
}) {
  const [internalValue, setInternalValue] = useState("");

  /* -------------------------
     DEBUG LOGS
  ------------------------- */
  useEffect(() => {
    console.log("---- SpaceSelector DEBUG ----");
    console.log("value (space_id):", value);
    console.log("spaces:", spaces);
    console.log(
      "matching space:",
      spaces.find((s) => String(s.id) === String(value))
    );
    console.log("-----------------------------");
  }, [value, spaces]);

  /* -------------------------
     SYNC VALUE AFTER LOAD
  ------------------------- */
  useEffect(() => {
    if (!value) {
      setInternalValue("");
      return;
    }

    const exists = spaces.some(
      (s) => String(s.id) === String(value)
    );

    if (exists) {
      setInternalValue(String(value));
    }
  }, [value, spaces]);

  const selected = spaces.find(
    (s) => String(s.id) === String(internalValue)
  );

  return (
    <Select
      value={internalValue}
      onValueChange={(val) => {
        console.log("Selected new space:", val);
        setInternalValue(val);
        onChange?.(val);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-9 text-sm w-full">
        {selected ? (
          <div className="flex items-center gap-2">
            {selected.logo_url ? (
              <Image
                src={selected.logo_url}
                alt={selected.name}
                width={16}
                height={16}
                className="rounded-sm"
              />
            ) : (
              <div className="rounded-sm bg-muted flex items-center justify-center text-[10px]">
                {selected.name?.[0]}
              </div>
            )}
            <span className="truncate">{selected.name}</span>
          </div>
        ) : (
          <SelectValue placeholder="Select space" />
        )}
      </SelectTrigger>

      <SelectContent>
        {spaces.map((space) => (
          <SelectItem key={space.id} value={String(space.id)}>
            <div className="flex items-center gap-2">
              {space.logo_url ? (
                <Image
                  src={space.logo_url}
                  alt={space.name}
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
              ) : (
                <div className="rounded-sm bg-muted flex items-center justify-center text-[10px]">
                  {space.name?.[0]}
                </div>
              )}
              <span>{space.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}