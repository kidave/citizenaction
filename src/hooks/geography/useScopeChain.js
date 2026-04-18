import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useScopeChain(scopeCode) {
  return useQuery({
    queryKey: ["scope-chain", scopeCode],
    enabled: !!scopeCode,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_scope_chain",
        { input_code: scopeCode }
      );

      if (error) throw error;
      return data || {};
    },
  });
}