import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function usePerfilCadastro() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["meu-perfil-cadastro", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles")
        .select("id,nome,whatsapp,morador,cadastro_completo_em,onboarding_concluido").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}