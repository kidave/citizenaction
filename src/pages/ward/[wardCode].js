// pages/ward/[wardCode]/index.js
import { useRouter } from "next/router";
import { useEffect } from "react";
import Spinner from "components/shared/ui/Spinner";

// This page's purpose is to redirect to the default tab.
export default function WardIndexPage() {
  const router = useRouter();
  const { wardCode } = router.query;

  useEffect(() => {
    if (wardCode) {
      router.replace(`/ward/${wardCode}/project`);
    }
  }, [wardCode, router]);

  // Render a loading state or null while redirecting
  return <Spinner mode="fullscreen" />;
}
