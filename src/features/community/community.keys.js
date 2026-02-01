// src/features/community/community.keys.js

export const communityKeys = {
  all: ["community"],

  lists: () => [...communityKeys.all, "list"],

  detail: (slug) => [...communityKeys.all, "detail", slug],

  committee: (slug) => [
    ...communityKeys.all,
    "detail",
    slug,
    "committee",
  ],
};
