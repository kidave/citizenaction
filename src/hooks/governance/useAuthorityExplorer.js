import { useState } from "react";

export function useAuthorityExplorer() {
  const [search, setSearch] = useState("");

  const [scope, setScope] = useState({
    country: "",
    state: "",
    region: "",
    city: "",
  });

  const [entityType, setEntityType] = useState("all");
  const [stack, setStack] = useState([]);

  function reset() {
    setSearch("");
    setScope({ state: "", region: "", city: "" });
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