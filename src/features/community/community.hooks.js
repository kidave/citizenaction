// src/features/community/community.hooks.js

import { useQuery } from "@tanstack/react-query";
import { communityKeys } from "./community.keys";
import {
  fetchCommunity,
  fetchCommunityCommittee,
} from "./community.api";

export function useCommunity(slug) {
  return useQuery({
    queryKey: communityKeys.detail(slug),
    queryFn: () => fetchCommunity(slug),
    enabled: !!slug,
  });
}

export function useCommunityCommittee(slug) {
  return useQuery({
    queryKey: communityKeys.committee(slug),
    queryFn: () => fetchCommunityCommittee(slug),
    enabled: !!slug,
  });
}
