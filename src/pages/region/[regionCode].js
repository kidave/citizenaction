// pages/region/[regionCode].js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Spinner from "components/shared/ui/Spinner";

export default function RegionPage() {
  const router = useRouter();
  const { regionCode } = router.query;

  useEffect(() => {
    if (router.isReady && regionCode) {
      // Redirect to meeting tab by default
      router.replace(`/region/${regionCode}/meeting`);
    }
  }, [router.isReady, regionCode]);

  // Show loading spinner while redirecting
  return <Spinner mode="fullscreen" />;
}
