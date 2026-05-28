"use client";

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
  const selectedSpace = spaces.find(
    (space) => String(space.id) === String(value),
  );

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(val) => {
        onChange?.(val);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-full text-sm">
        {selectedSpace ? (
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedSpace.logo_url ? (
              <Image
                src={selectedSpace.logo_url}
                alt={selectedSpace.name}
                width={18}
                height={18}
                className="shrink-0 rounded-sm"
              />
            ) : (
              <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm bg-muted text-[10px]">
                {selectedSpace.name?.[0]}
              </div>
            )}

            <span className="truncate">{selectedSpace.name}</span>
          </div>
        ) : (
          <SelectValue placeholder="Select space" />
        )}
      </SelectTrigger>

      <SelectContent>
        {spaces.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No spaces found
          </div>
        )}

        {spaces.map((space) => (
          <SelectItem key={space.id} value={String(space.id)}>
            <div className="flex items-center gap-2">
              {space.logo_url ? (
                <Image
                  src={space.logo_url}
                  alt={space.name}
                  width={18}
                  height={18}
                  className="shrink-0 rounded-sm"
                />
              ) : (
                <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm bg-muted text-[10px]">
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
