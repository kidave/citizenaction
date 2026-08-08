import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";
import SearchFiltersSkeleton from "@/components/skeletons/SearchFiltersSkeleton";
import EditorModalSkeleton from "@/components/skeletons/EditorModalSkeleton";

export default function RouteLoader() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingPath, setLoadingPath] = useState("");

  useEffect(() => {
    const start = (url) => {
      setLoadingPath(url);
      setLoading(true);
    };

    const end = () => {
      setLoading(false);
      setLoadingPath("");
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };
  }, [router]);

  if (!loading) return null;

  const pathname = loadingPath.split("?")[0];

  // -----------------------------------------
  // POST
  // -----------------------------------------

  if (pathname.startsWith("/post/")) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-4xl">
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // SETTINGS
  // -----------------------------------------

  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  if (pathname.startsWith("/search")) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          <SearchFiltersSkeleton />
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // GENERIC ROUTE LOADING
  // -----------------------------------------

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center">
      <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
