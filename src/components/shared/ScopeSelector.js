"use client";

import ScopeCombobox from "./ScopeCombobox";
import { useScopeSelector } from "@/hooks/geography/useScopeSelector";
import { Button } from "@/components/ui/button";

export default function ScopeSelector({
  value,
  onChange,
  levels,
  containerClassName,
  itemClassName,
  showClear = false,
}) {
  const { selected, scopeData, update, clear } = useScopeSelector({
    value,
    onChange,
    levels,
  });

  return (
    <div className={containerClassName}>
      {levels.map((level, index) => {
        const parent = levels[index - 1];
        const disabled = index !== 0 && !selected[parent];

        return (
          <ScopeCombobox
            key={level}
            className={itemClassName}
            items={scopeData[level]}
            value={selected[level]}
            onChange={(item) => update(level, item)}
            placeholder={`Select ${level}`}
            disabled={disabled}
          />
        );
      })}

      {showClear && <button onClick={clear}>Reset</button>}
    </div>
  );
}
