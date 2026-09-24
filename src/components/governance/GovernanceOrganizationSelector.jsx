"use client";

import { useMemo } from "react";

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

  const options = useMemo(
    () => [
      { id: "all", name: "All organizations" },
      ...(organizationsQuery.data || [])
        .filter((item) => item?.id && item?.name)
        .map((item) => ({
          id: item.id,
          name: item.name,
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
      autoHighlight
      className={className}
    >
      <ComboboxTrigger
        className="h-9 w-full justify-between rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs hover:bg-accent hover:text-accent-foreground"
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
          className="h-8"
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
