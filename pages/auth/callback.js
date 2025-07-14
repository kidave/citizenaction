// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const completeLogin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // check if profile exists
      const { data: existing } = await supabase
        .from("profile")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (!existing) {
        // create profile
        await supabase.from("profile").upsert([{
          user_id: user.id,
          first_name: user.user_metadata?.given_name || user.user_metadata?.full_name?.split(" ")[0] || '',
          last_name: user.user_metadata?.family_name || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          email: user.email,
          created_at: new Date(),
          ward_code: null,
          division_code: null,
          is_member: false,
          is_convenor: false,
          is_co_convenor: false,
          stakeholder: null,
          country_code: null,
          social: null,
        }], { onConflict: 'user_id' });
      }

      const returnTo = router.query.next || '/';
      router.push(returnTo);
    };

    completeLogin();
  }, [router]);

  return <div>Signing you in…</div>;
}