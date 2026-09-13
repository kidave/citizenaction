/**
 * Canonical TanStack Query keys.
 *
 * Keep key construction in one place so reads and invalidations always
 * target the same cache entries.
 */
export const queryKeys = {
  spaces: {
    all: ["spaces"],
    list: ({ search, privateAccess = false, includeInactive = false, userId } = {}) => [
      "spaces",
      "list",
      { search, privateAccess, includeInactive, userId },
    ],
    detail: ({ slug, privateAccess = false, includeInactive = false, userId } = {}) => [
      "spaces",
      "detail",
      { slug, privateAccess, includeInactive, userId },
    ],
    members: (spaceId) => ["spaces", "members", spaceId],
  },
};
