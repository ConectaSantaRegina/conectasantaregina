import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type Tabela = keyof Database["public"]["Tables"];

export type Registro = Record<string, unknown> & {
  id: string;
  user_id?: string;
  created_at?: string;
};

/** Consulta genérica: tudo da tabela, mais recentes primeiro. */
export function useLista(tabela: Tabela, limite?: number) {
  return useQuery({
    queryKey: [tabela, limite ?? "all"],
    queryFn: async (): Promise<Registro[]> => {
      let query = supabase
        .from(tabela as "comercios")
        .select("*")
        .order("created_at", { ascending: false });
      if (limite) query = query.limit(limite);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Registro[];
    },
  });
}

export function useInvalidar(tabela: Tabela) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [tabela] });
}

export async function inserirRegistro(tabela: Tabela, payload: Record<string, unknown>) {
  const { error } = await supabase
    .from(tabela as "comercios")
    .insert(payload as never);
  if (error) throw error;
}

export async function apagarRegistro(tabela: Tabela, id: string) {
  const { error } = await supabase
    .from(tabela as "comercios")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export function formatarData(valor?: string) {
  if (!valor) return "";
  return new Date(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function linkWhatsapp(numero?: string | null) {
  if (!numero) return null;
  const limpo = numero.replace(/\D/g, "");
  if (limpo.length < 10) return null;
  return `https://wa.me/55${limpo}`;
}
