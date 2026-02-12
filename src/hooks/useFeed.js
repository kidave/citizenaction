import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useFeed() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  async function fetchFeed() {
    setLoading(true);
    const { data, error } = await supabase
      .from("public_action_posts_view")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) setData(data || []);
    setLoading(false);
  }

  return { data, loading, refetch: fetchFeed };
}
