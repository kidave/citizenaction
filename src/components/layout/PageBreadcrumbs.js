import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const STATIC_LABELS = {
  community: "Community",
  club: "Club",
  manage: "Manage",
  search: "Search",
  apply: "Apply",
};

export default function PageBreadcrumbs() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { community, scopeType, scopeCode } = router.query;

  // 🔹 Pull cached data (NO new fetch)
  const communityData = community
    ? queryClient.getQueryData(["community", community])
    : null;

  const clubData =
    community && scopeType && scopeCode
      ? queryClient.getQueryData([
          "club-public",
          community,
          scopeType,
          scopeCode,
        ])
      : null;

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

/* ---------------- helpers ---------------- */

function resolveDynamicLabel({
  seg,
  community,
  scopeCode,
  communityData,
  clubData,
}) {
  // community slug → community name
  if (seg === community && communityData?.name) {
    return communityData.name;
  }

  // club scopeCode → club name
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
