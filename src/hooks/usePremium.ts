import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Premium do usuário logado: liberado pelo admin com data de validade.
 * Quando a validade vence, o acesso desliga sozinho.
 */
export function usePremium() {
  const { user, isAdmin, loading } = useAuth();

  const consulta = useQuery({
    queryKey: ["meu-premium", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const hoje = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("premium")
        .select("id,valido_ate,ativo")
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .gte("valido_ate", hoje)
        .limit(1);
      if (error) throw error;
      return (data ?? []).length > 0;
    },
  });

  const premium = Boolean(consulta.data);

  return {
    premium,
    /** Direito de tentar publicar novidades/destaques (ainda passa por aprovação). */
    podePublicarNovidades: isAdmin || premium,
    carregando: loading || consulta.isLoading,
  };
}
