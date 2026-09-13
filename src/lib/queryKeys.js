/**
 * Canonical TanStack Query keys.
 *
 * Keep key construction in one place so reads and invalidations always
 * target the same cache entries.
 */
export const queryKeys = {
  feed: {
    all: ["feed"],
    list: ({ categorySlug = "" } = {}) => ["feed", { categorySlug }],
    categories: ["feed-categories"],
  },
  posts: {
    all: ["posts"],
    detail: (postId) => ["post", postId],
    stats: (postId, userId) => ["post-stats", postId, userId],
    author: (authorId) => ["post-author", authorId],
    spaces: (postId) => ["post-spaces", postId],
    governance: (postId) => ["post-governance", postId],
    search: (search) => ["post-search", search],
  },
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
    feed: (spaceId) => ["space-feed", spaceId],
  },
  users: {
    all: ["users"],
    myProfile: (userId) => ["my-profile", userId],
    posts: (userId) => ["user-posts", userId],
    spaces: (userId) => ["user-spaces", userId],
    publicProfile: (username) => ["public-profile", username],
  },
  contributions: {
    detail: (postId) => ["contribution", postId],
  },
  governance: {
    all: ["governance"],
    record: (slug) => ["governance", "record", slug],
    person: (personSlug) => ["governance", "person", personSlug],
    position: (organizationSlug, positionSlug) => [
      "governance",
      "position",
      organizationSlug,
      positionSlug,
    ],
  },
};
