import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminPremium() {
  return useQuery({
    queryKey: ["admin-premium-usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("premium")
        .select("id,user_id,comercio_id,valido_ate,ativo,observacao,created_at")
        .is("comercio_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}