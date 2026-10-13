import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { txt, type Registro } from "@/lib/dados";

export type CategoriaComercio = {
  id: string;
  nome: string;
  chave: string;
  categoria_pai_id: string | null;
};
export type VinculoSubcategoria = { comercio_id: string; subcategoria_id: string };
export type ComercioClassificado = {
  registro: Registro;
  categoria: CategoriaComercio | undefined;
  subcategorias: CategoriaComercio[];
};

export function normalizarCategoria(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

export function classificarComercios(
  itens: Registro[],
  categorias: CategoriaComercio[],
  vinculos: VinculoSubcategoria[],
): ComercioClassificado[] {
  const porId = new Map(categorias.map((categoria) => [categoria.id, categoria]));
  return itens.map((registro) => {
    const legado = txt(registro, "categoria");
    const chaveLegada = normalizarCategoria(legado === "Mercado e Padaria" ? "Mercado" : legado === "Panificadora" ? "Padaria" : legado);
    const subLegada = categorias.find((categoria) => categoria.categoria_pai_id && categoria.chave === chaveLegada);
    const categoriaId = txt(registro, "categoria_principal_id") || subLegada?.categoria_pai_id;
    const categoria = categoriaId ? porId.get(categoriaId) : undefined;
    let subcategorias = vinculos.filter((vinculo) => vinculo.comercio_id === registro.id)
      .flatMap((vinculo) => {
        const sub = porId.get(vinculo.subcategoria_id);
        return sub && sub.categoria_pai_id === categoria?.id ? [sub] : [];
      });
    // Compatibility with the current registration form until stage two.
    if (!subcategorias.length && subLegada?.categoria_pai_id === categoria?.id) {
      subcategorias = subLegada ? [subLegada] : [];
      if (legado === "Mercado e Padaria") {
        const padaria = categorias.find((sub) => sub.categoria_pai_id === categoria?.id && sub.chave === "padaria");
        if (padaria) subcategorias.push(padaria);
      }
    }
    return { registro, categoria, subcategorias };
  });
}

export function useTaxonomiaComercio() {
  return useQuery({
    queryKey: ["taxonomia-comercio"],
    queryFn: async () => {
      const [categorias, vinculos] = await Promise.all([
        supabase.from("comercio_categorias").select("id,nome,chave,categoria_pai_id").eq("status", "aprovado").order("nome"),
        supabase.from("comercio_subcategorias").select("comercio_id,subcategoria_id"),
      ]);
      if (categorias.error) throw categorias.error;
      if (vinculos.error) throw vinculos.error;
      return { categorias: categorias.data ?? [], vinculos: vinculos.data ?? [] };
    },
  });
}