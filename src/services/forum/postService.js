export async function fetchPost(postId) {
  const { data, error } = await supabase
    .from("forum_topics")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
}