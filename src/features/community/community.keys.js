// src/features/community/community.keys.js

export const communityKeys = {
  all: ["community"],

  lists: () => [...communityKeys.all, "list"],

  detail: (slug) => [...communityKeys.all, "detail", slug],

  club: (slug) => [
    ...communityKeys.all,
    "detail",
    slug,
    "club",
  ],
};
