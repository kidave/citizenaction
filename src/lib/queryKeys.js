/**
 * Canonical TanStack Query keys.
 *
 * Keep key construction in one place so reads and invalidations always
 * target the same cache entries.
 */
export const queryKeys = {
  auth: { userStatus: ["userStatus"] },
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
    permissions: (postId) => ["post-permissions", postId],
  },
  spaces: {
    all: ["spaces"],
    list: ({ search, privateAccess = false, includeInactive = false, userId } = {}) => ["spaces", "list", { search, privateAccess, includeInactive, userId }],
    detail: ({ slug, privateAccess = false, includeInactive = false, userId } = {}) => ["spaces", "detail", { slug, privateAccess, includeInactive, userId }],
    members: (spaceId) => ["spaces", "members", spaceId],
    feed: (spaceId) => ["space-feed", spaceId],
    applications: (spaceId) => ["space-applications", spaceId],
  },
  users: {
    all: ["users"],
    myProfile: (userId) => ["my-profile", userId],
    posts: (userId) => ["user-posts", userId],
    spaces: (userId) => ["user-spaces", userId],
    contributions: (userId) => ["user-contributions", userId],
    publicProfile: (username) => ["public-profile", username],
    stats: (userId) => ["user-profile-stats", userId],
    personCareer: (governanceId) => ["person-career", governanceId],
  },
  contributions: { detail: (postId) => ["contribution", postId] },
  governance: {
    all: ["governance"],
    directory: ({ tab = "organizations", search = "", type = "all", categoryId = "all", geographyId = null, organizationId = null } = {}) => ["governance-directory", tab, search, type, categoryId, geographyId, organizationId],
    tree: ({ parentId = null, search = "", type = null } = {}) => ["governance-tree", parentId, search, type],
    record: (slug) => ["governance", "record", slug],
    person: (personSlug) => ["governance", "person", personSlug],
    position: (organizationSlug, positionSlug) => ["governance", "position", organizationSlug, positionSlug],
    geography: (governanceId) => ["governance-geography", governanceId],
    family: (slug) => ["governance-family", slug],
    directoryGeographies: (params = {}) => ["governance-directory-geographies", params],
    adminEntities: ["admin-governance-entities"],
    contributions: ["governance-contributions"],
    adminState: ["governance-admin-state"],
  },
  admin: {
    users: ["admin-users"],
    dashboard: ["admin-dashboard"],
    governanceEntities: ["admin-governance-entities"],
  },
  standards: {
    systems: ["classification-systems"],
    dimensions: (systemId) => ["classification-dimensions", systemId],
    codes: (dimensionId) => ["classification-codes", dimensionId],
    tree: (dimensionId) => ["classification-tree", dimensionId],
  },
};
