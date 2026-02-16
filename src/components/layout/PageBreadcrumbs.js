"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import { useClubs } from "@/hooks/useClubs";

const STATIC_LABELS = {
  community: "Community",
  club: "Club",
  manage: "Manage",
  search: "Search",
  apply: "Apply",
  action: "Create Action",
  about: "About",
  settings: "Settings",
};

export default function PageBreadcrumbs() {
  const router = useRouter();
  const { community, scopeType, scopeCode } = router.query;

  /* ---------------- FETCH DYNAMIC DATA ---------------- */

  const { data: communityData } = useCommunities({
    slug: community,
    enabled: !!community,
  });

  const { data: clubList } = useClubs({
    communitySlug: community,
    scopeType,
    scopeCode,
    enabled: !!community && !!scopeType && !!scopeCode,
  });

  const clubData = Array.isArray(clubList)
    ? clubList?.[0]
    : clubList;

  /* ---------------- PATH SEGMENTS ---------------- */

  const segments = router.asPath
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  let href = "";

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      <Link href="/" className="hover:underline">
        Home
      </Link>

      {segments.map((seg, i) => {
        href += `/${seg}`;

        const label =
          resolveDynamicLabel({
            seg,
            community,
            scopeCode,
            communityData,
            clubData,
          }) ||
          STATIC_LABELS[seg] ||
          prettify(seg);

        return (
          <span key={i} className="flex items-center">
            <ChevronRight className="mx-2 h-4 w-4" />
            <Link href={href} className="hover:underline">
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

/* ---------------- HELPERS ---------------- */

function resolveDynamicLabel({
  seg,
  community,
  scopeCode,
  communityData,
  clubData,
}) {
  // Replace community slug with community.name
  if (seg === community && communityData?.name) {
    return communityData.name;
  }

  // Replace scopeCode with club.name
  if (seg === scopeCode && clubData?.name) {
    return clubData.name;
  }

  return null;
}

function prettify(value) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
