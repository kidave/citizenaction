import { useState } from "react";

export function useAuthorityExplorer() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [stack, setStack] = useState([]);

  function reset() {
    setSearch("");
    setEntityType("all");
    setStack([]);
  }

  return { search, setSearch, entityType, setEntityType, stack, setStack, reset };
}
