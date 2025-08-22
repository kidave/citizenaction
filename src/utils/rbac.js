// utils/rbac.js
export async function isWardManager(supabase, wardCode) {
  const { data, error } = await supabase
    .from("committee")
    .select("role_id")
    .eq("ward_code", wardCode)
    .eq("user_id", (await supabase.auth.getUser()).data?.user?.id || "")
    .maybeSingle();

  if (error) return false;
  const role = data?.role_id;
  return role === 1 || role === 2; // convenor/co-convenor
}
