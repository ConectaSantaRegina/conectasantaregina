import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ehRobo, jaRegistradoHoje, visitanteAnonimo } from "@/lib/visitas";

function hoje() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function contexto(userId?: string) {
  if (typeof window === "undefined" || ehRobo(navigator.userAgent)) return null;
  let visitante: string;
  try { visitante = visitanteAnonimo(localStorage, () => crypto.randomUUID()); }
  catch { visitante = visitanteAnonimo(sessionStorage, () => crypto.randomUUID()); }
  return { visitante, quem: userId ?? visitante };
}

/** Total de visitas e registro (uma vez por dia) da visita atual. */
export function useVisitasSite() {
  const { user, isAdmin, loading } = useAuth();
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    if (loading) return;
    let ativo = true;
    const ctx = isAdmin ? null : contexto(user?.id);
    const registrar = ctx && !jaRegistradoHoje(localStorage, `site:${ctx.quem}`, hoje());
    const req = registrar
      ? supabase.rpc("registrar_visita", { p_visitante: ctx.visitante, p_pagina: "inicio" })
      : supabase.rpc("total_visitas");
    req.then(({ data }) => { if (ativo && typeof data === "number") setTotal(data); });
    return () => { ativo = false; };
  }, [loading, isAdmin, user?.id]);
  return total;
}

/** Registra uma visualização quando o card aparece na tela. */
export function useRegistrarVisualizacao(id: string, tipo: "feed" | "comercio") {
  const ref = useRef<HTMLElement | null>(null);
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    const el = ref.current;
    if (loading || isAdmin || !el) return;
    const obs = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      const ctx = contexto(user?.id);
      if (!ctx || jaRegistradoHoje(localStorage, `${id}:${ctx.quem}`, hoje())) return;
      supabase.rpc("registrar_visualizacao", { p_publicacao: id, p_tipo: tipo, p_visitante: ctx.visitante })
        .then(() => queryClient.invalidateQueries({ queryKey: ["visualizacoes"] }));
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [id, tipo, loading, isAdmin, user?.id, queryClient]);
  return ref;
}

/** Contagens agregadas de visualizações para uma lista de publicações. */
export function useVisualizacoes(ids: string[]) {
  const chave = [...ids].sort().join(",");
  const { data } = useQuery({
    queryKey: ["visualizacoes", chave],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("contagem_visualizacoes", { p_ids: ids });
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.publicacao_id, Number(r.total)])) as Record<string, number>;
    },
  });
  return data ?? {};
}

export function useResumoVisitas(ativo: boolean) {
  return useQuery({
    queryKey: ["admin-resumo-visitas"],
    enabled: ativo,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_resumo_visitas");
      if (error) throw error;
      return data?.[0];
    },
  });
}
