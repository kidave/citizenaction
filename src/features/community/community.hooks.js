// src/features/community/community.hooks.js

import { useQuery } from "@tanstack/react-query";
import { communityKeys } from "./community.keys";
import {
  fetchCommunity,
  fetchCommunityClub,
} from "./community.api";

export function useCommunity(slug) {
  return useQuery({
    queryKey: communityKeys.detail(slug),
    queryFn: () => fetchCommunity(slug),
    enabled: !!slug,
  });
}

export function useCommunityClub(slug) {
  return useQuery({
    queryKey: communityKeys.club(slug),
    queryFn: () => fetchCommunityClub(slug),
    enabled: !!slug,
  });
}
