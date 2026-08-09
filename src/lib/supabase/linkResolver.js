import { supabase } from "./client";

export async function resolveLink(url) {
  if (!url) {
    throw new Error("URL is required");
  }

  const { data, error } = await supabase.functions.invoke("resolve-link", {
    body: {
      url,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.link) {
    throw new Error("Unable to resolve link");
  }

  return data.link;
}
