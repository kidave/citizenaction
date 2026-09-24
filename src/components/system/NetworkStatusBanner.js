"use client";

import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [hasIssue, setHasIssue] = useState(false);

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      setHasIssue(false);
    } catch (err) {
      setHasIssue(true);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!hasIssue) return null;

  return (
    <div className="w-full border-b border-yellow-300 bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-900">
      ⚠️ We’re experiencing connectivity issues affecting some Indian ISPs. If
      login is not working, please switch to DNS 1.1.1.1 or 8.8.8.8.
    </div>
  );
}
