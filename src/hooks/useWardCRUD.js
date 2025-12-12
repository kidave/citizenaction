// hooks/useWardCRUD.js
import useScopeCRUD from "./useScopeCRUD";

/**
 * Backwards-compatible wrapper for existing code.
 * Internally uses the new scope-aware CRUD.
 */
export default function useWardCRUD(resource, wardCode) {
  return useScopeCRUD("ward", wardCode, resource);
}
