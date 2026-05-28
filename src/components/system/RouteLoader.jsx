import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RouteLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const end = () => setLoading(false);

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

  return (
    <div className="fixed left-0 top-0 z-50 h-[2px] w-full animate-pulse bg-primary" />
  );
}
