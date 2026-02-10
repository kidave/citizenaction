// src/features/community/community.api.js

export async function fetchCommunity(slug) {
  const res = await fetch(`/api/community/${slug}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to load community");
  }

  return data;
}

export async function fetchCommunityClub(slug) {
  const res = await fetch(`/api/community/${slug}/club`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to load club");
  }

  return data;
}
