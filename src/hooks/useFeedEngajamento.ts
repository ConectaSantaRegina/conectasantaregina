import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { MetricaFeed } from "@/lib/feed-engajamento";

export function useFeedEngajamento(ids: string[]) {
  const { user } = useAuth();
  const client = useQueryClient();
  const chaveIds = [...ids].sort().join(",");
  const metricas = useQuery({
    queryKey: ["feed-metricas", chaveIds, user?.id ?? "visitante"],
    enabled: ids.length > 0,
    queryFn: async (): Promise<MetricaFeed[]> => {
      const { data, error } = await supabase.from("feed_metricas").select("publicacao_id,curtidas,compartilhamentos").in("publicacao_id", ids);
      if (error) throw error;
      return data ?? [];
    },
  });
  const curtidas = useQuery({
    queryKey: ["feed-minhas-curtidas", chaveIds, user?.id],
    enabled: Boolean(user) && ids.length > 0,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("feed_curtidas").select("publicacao_id").eq("user_id", user.id).in("publicacao_id", ids);
      if (error) throw error;
      return (data ?? []).map(item => item.publicacao_id);
    },
  });
  useEffect(() => {
    if (!chaveIds) return;
    const channel = supabase.channel(`feed-metricas-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "feed_metricas" }, () => {
        void client.invalidateQueries({ queryKey: ["feed-metricas"] });
        void client.invalidateQueries({ queryKey: ["feed-minhas-curtidas"] });
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [client, chaveIds, user?.id]);
  return {
    metricas: metricas.data ?? [],
    curtidas: curtidas.data ?? [],
    carregando: metricas.isLoading || curtidas.isLoading,
    erro: metricas.error || curtidas.error,
    atualizar: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["feed-metricas"] }),
        client.invalidateQueries({ queryKey: ["feed-minhas-curtidas"] }),
      ]);
    },
  };
}