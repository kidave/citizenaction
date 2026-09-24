"use client";

import { useMemo, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { useGovernanceOrganizations } from "@/hooks/governance/useGovernanceOrganizations";

export default function GovernanceOrganizationSelector({
  value = null,
  onValueChange,
  className,
}) {
  const organizationsQuery = useGovernanceOrganizations();
  const [search, setSearch] = useState("");

  const options = useMemo(
    () => [
      { id: "all", name: "All organizations" },
      ...(organizationsQuery.data || [])
        .filter((item) => item?.id && item?.name)
        .map((item) => ({
          id: item.id,
          name: item.name,
          shortName: item.short_name || "",
        })),
    ],
    [organizationsQuery.data],
  );

  const selected = useMemo(
    () => options.find((item) => item.id === value) || options[0],
    [options, value],
  );

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(item) => {
        onValueChange?.(item?.id === "all" ? null : item?.id || null);
      }}
      itemToStringLabel={(item) => item?.name || ""}
      itemToStringValue={(item) => item?.name || ""}
      isItemEqualToValue={(item, currentValue) =>
        item?.id === currentValue?.id
      }
      filter={(item, query) => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        if (!normalizedQuery) return true;
        return [item?.name, item?.shortName]
          .filter(Boolean)
          .some((value) =>
            value.toLocaleLowerCase().includes(normalizedQuery),
          );
      }}
      autoHighlight
      className={className}
    >
      <ComboboxTrigger
        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm font-normal font-sans shadow-xs hover:bg-accent hover:text-accent-foreground"
        aria-label="Select organization"
      >
        <ComboboxValue placeholder="All organizations" />
      </ComboboxTrigger>

      <ComboboxContent className="w-[min(28rem,calc(100vw-1.5rem))]">
        <ComboboxInput
          showTrigger={false}
          showClear={false}
          placeholder="Search organizations..."
          aria-label="Search organizations"
          value={search}
          onInputValueChange={setSearch}
          showInputClear={Boolean(search)}
          onClearInput={() => setSearch("")}
          className="h-9 rounded-md"
        />
        <ComboboxEmpty>
          {organizationsQuery.isLoading
            ? "Loading organizations..."
            : "No organizations found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
