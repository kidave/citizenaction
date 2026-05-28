"use client";

import { useState } from "react";

export function useLocationSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search(query) {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=5`,
      );

      const data = await res.json();

      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return {
    results,
    loading,
    search,
  };
}
