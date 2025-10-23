// utils/checkWardRole.js
import { createServerSupabase } from "utils/supabaseServer";

export async function checkWardRole(token, wardCode, requiredRoles = [1, 2, 3]) {
  if (!token) {
    return { hasAccess: false, error: "Not authenticated" };
  }

  const supabase = createServerSupabase(token);

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { hasAccess: false, error: "Invalid or expired token" };
  }

  // Check if user has the required role for this ward
  const { data: committeeData, error } = await supabase
    .from("committee")
    .select("role_id")
    .eq("user_id", user.id)
    .eq("ward_code", wardCode)
    .maybeSingle();

  if (error) {
    return { hasAccess: false, error: "Database error" };
  }

  if (!committeeData) {
    return { hasAccess: false, error: "Not a committee member for this ward" };
  }

  const hasAccess = requiredRoles.includes(committeeData.role_id);
  
  return { 
    hasAccess, 
    error: hasAccess ? null : "Insufficient permissions",
    roleId: committeeData.role_id,
    userId: user.id
  };
}