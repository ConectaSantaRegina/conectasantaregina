import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EstadoVazio } from "@/components/site/PageHero";
import { txt, type Registro } from "@/lib/dados";

export function ListaFiltrada({
  itens,
  carregando,
  categorias,
  campoCategoria,
  camposBusca,
  vazio,
  render,
}: {
  itens: Registro[];
  carregando: boolean;
  categorias?: string[];
  campoCategoria?: string;
  camposBusca: string[];
  vazio: string;
  render: (item: Registro) => React.ReactNode;
}) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  // Só mostra as categorias que têm pelo menos um item no momento.
  const disponiveis = useMemo(() => {
    if (!categorias || !campoCategoria) return undefined;
    return categorias.filter((opcao) =>
      itens.some((item) => txt(item, campoCategoria) === opcao),
    );
  }, [itens, categorias, campoCategoria]);

  // Quantidade de itens aprovados por categoria (os itens já vêm aprovados da consulta).
  const contagens = useMemo(() => {
    if (!campoCategoria) return new Map<string, number>();
    const mapa = new Map<string, number>();
    for (const item of itens) {
      const chave = txt(item, campoCategoria);
      mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
    }
    return mapa;
  }, [itens, campoCategoria]);

  // Se a categoria escolhida ficar vazia, volta para "Todos".
  useEffect(() => {
    if (categoria !== "Todos" && disponiveis && !disponiveis.includes(categoria)) {
      setCategoria("Todos");
    }
  }, [disponiveis, categoria]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter((item) => {
      if (campoCategoria && categoria !== "Todos" && txt(item, campoCategoria) !== categoria) {
        return false;
      }
      if (!termo) return true;
      return camposBusca.some((campo) => txt(item, campo).toLowerCase().includes(termo));
    });
  }, [itens, busca, categoria, campoCategoria, camposBusca]);

  return (
    <div>
      <div className="grid gap-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar…"
            className="pl-9"
            aria-label="Buscar"
          />
        </div>
        {categorias && disponiveis && (
          <div className="flex flex-wrap gap-2">
            {["Todos", ...[...disponiveis].sort((a, b) => a.localeCompare(b, "pt-BR"))].map(
              (opcao) => (
                <Button
                  key={opcao}
                  size="sm"
                  variant={categoria === opcao ? "default" : "secondary"}
                  onClick={() => setCategoria(opcao)}
                >
                  {opcao}
                </Button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        {carregando ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="surface-card h-52 animate-pulse bg-muted/60" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <EstadoVazio texto={vazio} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((item) => render(item))}
          </div>
        )}
      </div>
    </div>
  );
}
