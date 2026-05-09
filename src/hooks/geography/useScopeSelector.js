import { useEffect, useState } from "react";
import { useGeographicScopes } from "@/hooks/geography/useGeographicScopes";
import { useScopeChain } from "@/hooks/geography/useScopeChain";

export function useScopeSelector({ value, onChange, levels }) {
  const [selected, setSelected] = useState({});
  const [hydrated, setHydrated] = useState(false);

  const { data: chain } = useScopeChain(value?.scope_code);

  /* ---------------- HYDRATION ---------------- */
  useEffect(() => {
    if (!value?.scope_code) {
      setSelected({});
      setHydrated(false);
      return;
    }

    if (!chain || hydrated) return;

    let next = {};

    if (chain.type === "ward") {
      next = {
        ward: chain.code,
        city: chain.parent_code,
        region: chain.grandparent_code,
      };
    }

    if (chain.type === "city") {
      next = {
        city: chain.code,
        region: chain.parent_code,
      };
    }

    if (chain.type === "region") {
      next = { region: chain.code };
    }

    if (chain.type === "state") {
      next = { state: chain.code };
    }

    setSelected(next);
    setHydrated(true);
  }, [chain, value?.scope_code, hydrated]);

  /* ---------------- DATA ---------------- */

  const stateData = useGeographicScopes({
    type: "state",
    enabled: levels.includes("state"),
  }).data || [];

  const regionData = useGeographicScopes({
    type: "region",
    parentCode: selected.state,
    enabled: levels.includes("region") && !!selected.state,
  }).data || [];

  const cityData = useGeographicScopes({
    type: "city",
    parentCode: selected.region,
    enabled: levels.includes("city") && !!selected.region,
  }).data || [];

  const wardData = useGeographicScopes({
    type: "ward",
    parentCode: selected.city,
    enabled: levels.includes("ward") && !!selected.city,
  }).data || [];

  const scopeData = {
    state: stateData,
    region: regionData,
    city: cityData,
    ward: wardData,
  };

  /* ---------------- UPDATE ---------------- */

  function update(level, item) {
    const index = levels.indexOf(level);

    let next = { ...selected };
    next[level] = item.code;

    for (let i = index + 1; i < levels.length; i++) {
      delete next[levels[i]];
    }

    setSelected(next);

    // emit deepest
    for (let i = levels.length - 1; i >= 0; i--) {
      const l = levels[i];
      if (next[l]) {
        onChange({
          scope_type: l,
          scope_code: next[l],
          scope_name: item.name,
        });
        return;
      }
    }
  }

  function clear() {
    setSelected({});
    onChange({
      scope_type: null,
      scope_code: null,
      scope_name: null,
    });
  }

  return {
    selected,
    scopeData,
    update,
    clear,
  };
}