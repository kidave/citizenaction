import { useState } from "react";

export function useAuthorityExplorer() {
  const [search, setSearch] = useState("");

  const [scope, setScope] = useState({
    scope_type: "country",
    scope_code: "IN",
  });

  const [entityType, setEntityType] = useState("all");
  const [stack, setStack] = useState([]);

  function reset() {
    setSearch("");
    setScope({ scope_type: "country", scope_code: "IN" });
    setEntityType("all");
    setStack([]);
  }

  return {
    search,
    setSearch,
    scope,
    setScope,
    entityType,
    setEntityType,
    stack,
    setStack,
    reset,
  };
}