import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContagensNav = Record<string, number>;

/** Conta itens aprovados de uma tabela, com filtros extras opcionais. */
async function contar(
  tabela: "comercios" | "vagas" | "imoveis" | "novidades" | "acoes",
  filtros: (q: any) => any = (q) => q,
): Promise<number> {
  let query = supabase
    .from(tabela)
    .select("id", { count: "exact", head: true })
    .eq("aprovado", true);
  query = filtros(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * Quantidade de itens aprovados e visíveis por aba do menu.
 * As chaves são os caminhos das rotas (ex.: "/comercio").
 */
export function useContagemNav() {
  return useQuery({
    queryKey: ["contagem-nav"],
    refetchInterval: 60_000,
    queryFn: async (): Promise<ContagensNav> => {
      const [comercio, saude, vagas, imoveis, novidades, acoes] = await Promise.all([
        contar("comercios", (q) => q.neq("secao", "publico")),
        contar("comercios", (q) => q.eq("secao", "publico")),
        contar("vagas"),
        contar("imoveis"),
        contar("novidades", (q) => q.eq("canal", "novidades")),
        contar("acoes"),
      ]);
      return {
        "/comercio": comercio,
        "/saude": saude,
        "/empregos": vagas,
        "/imoveis": imoveis,
        "/novidades": novidades,
        "/acoes": acoes,
      };
    },
  });
}
