// pages/ward/[wardId]/index.js
import { useRouter } from "next/router";
import { useEffect } from "react";

// This page's purpose is to redirect to the default tab.
export default function WardIndexPage() {
  const router = useRouter();
  const { wardId } = router.query;

  useEffect(() => {
    if (wardId) {
      router.replace(`/ward/${wardId}/meeting`);
    }
  }, [wardId, router]);

  // Render a loading state or null while redirecting
  return <div>Loading...</div>;
}
