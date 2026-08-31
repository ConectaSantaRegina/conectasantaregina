import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Tabela = keyof Database["public"]["Tables"];

export type Registro = Record<string, unknown> & {
  id: string;
  user_id?: string;
  created_at?: string;
};

/**
 * Colunas visíveis para visitantes não autenticados.
 * O user_id de quem publicou nunca é exposto publicamente.
 */
const COLUNAS_PUBLICAS: Partial<Record<Tabela, string>> = {
  acoes: "id,titulo,tipo,descricao,meta,local,contato,imagem_url,created_at,updated_at",
  comercios:
    "id,nome,secao,categoria,descricao,endereco,telefone,whatsapp,instagram,horario,delivery,imagem_url,created_at,updated_at",
  imoveis:
    "id,titulo,finalidade,tipo,preco,endereco,descricao,contato,imagem_url,created_at,updated_at",
  novidades: "id,titulo,texto,categoria,imagem_url,created_at,updated_at",
  sugestoes: "id,titulo,descricao,local,status,created_at,updated_at",
  vagas: "id,titulo,empresa,descricao,tipo,salario,contato,created_at,updated_at",
  sugestao_apoios: "sugestao_id",
};

const SEM_ORDENACAO: Tabela[] = ["sugestao_apoios"];

/** Consulta genérica: mais recentes primeiro. */
export function useLista(tabela: Tabela, limite?: number) {
  const { user } = useAuth();
  const autenticado = Boolean(user);

  return useQuery({
    queryKey: [tabela, limite ?? "all", autenticado],
    queryFn: async (): Promise<Registro[]> => {
      const colunas = autenticado ? "*" : (COLUNAS_PUBLICAS[tabela] ?? "*");
      let query = supabase.from(tabela as "comercios").select(colunas as "*");
      if (!(autenticado === false && SEM_ORDENACAO.includes(tabela))) {
        query = query.order("created_at", { ascending: false });
      }
      if (limite) query = query.limit(limite);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Registro[];
    },
  });
}

export function useInvalidar(tabela: Tabela) {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: [tabela] });
    await queryClient.invalidateQueries({ queryKey: ["minhas-publicacoes"] });
  };
}

export async function inserirRegistro(tabela: Tabela, payload: Record<string, unknown>) {
  const { error } = await supabase
    .from(tabela as "comercios")
    .insert(payload as never);
  if (error) throw error;
}

export async function atualizarRegistro(
  tabela: Tabela,
  id: string,
  payload: Record<string, unknown>,
) {
  const { error } = await supabase
    .from(tabela as "comercios")
    .update(payload as never)
    .eq("id", id);
  if (error) throw error;
}

export async function apagarRegistro(tabela: Tabela, id: string) {
  const { error } = await supabase
    .from(tabela as "comercios")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/** Lê um campo de texto do registro genérico. */
export function txt(registro: Registro, campo: string): string {
  const valor = registro[campo];
  return valor === null || valor === undefined ? "" : String(valor);
}

/** Lê um campo booleano do registro genérico. */
export function bool(registro: Registro, campo: string): boolean {
  return Boolean(registro[campo]);
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
