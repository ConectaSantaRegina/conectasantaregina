import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EstadoVazio } from "@/components/site/PageHero";
import { txt } from "@/lib/dados";
import { normalizarCategoria, type ComercioClassificado } from "@/lib/taxonomia-comercio";

export function ListaComercios({ itens, carregando, erro, render }: {
  itens: ComercioClassificado[];
  carregando: boolean;
  erro: boolean;
  render: (item: ComercioClassificado) => ReactNode;
}) {
  const [busca, setBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [expandido, setExpandido] = useState(false);
  const categorias = useMemo(() => [...new Map(itens.flatMap((item) => item.categoria ? [[item.categoria.id, item.categoria] as const] : [])).values()]
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [itens]);
  const categoriaAtiva = categorias.some((categoria) => categoria.id === categoriaId) ? categoriaId : "";
  const subcategorias = useMemo(() => [...new Map(itens.filter((item) => item.categoria?.id === categoriaAtiva)
    .flatMap((item) => item.subcategorias.map((sub) => [sub.id, sub] as const))).values()]
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [itens, categoriaAtiva]);
  const subcategoriaAtiva = subcategorias.some((sub) => sub.id === subcategoriaId) ? subcategoriaId : "";
  const grupos = useMemo(() => {
    const termo = normalizarCategoria(busca);
    const filtrados = itens.filter((item) => {
      if (categoriaAtiva && item.categoria?.id !== categoriaAtiva) return false;
      if (subcategoriaAtiva && !item.subcategorias.some((sub) => sub.id === subcategoriaAtiva)) return false;
      return !termo || normalizarCategoria([
        txt(item.registro, "nome"), txt(item.registro, "descricao"), txt(item.registro, "endereco"),
        txt(item.registro, "categoria"), item.categoria?.nome ?? "", ...item.subcategorias.map((sub) => sub.nome),
      ].join(" ")).includes(termo);
    });
    const agrupados = new Map<string, ComercioClassificado[]>();
    for (const item of filtrados) {
      const nome = item.categoria?.nome ?? "Outros comércios";
      const grupo = agrupados.get(nome) ?? [];
      grupo.push(item);
      agrupados.set(nome, grupo);
    }
    return [...agrupados.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
      .map(([nome, grupo]) => ({ nome, itens: grupo.sort((a, b) => txt(a.registro, "nome").localeCompare(txt(b.registro, "nome"), "pt-BR")) }));
  }, [itens, busca, categoriaAtiva, subcategoriaAtiva]);

  return <div>
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar…" aria-label="Buscar comércios, categorias e subcategorias" className="h-11 pl-9" />
    </div>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Categorias principais">
      <Button className="min-h-11 px-4" variant={categoriaAtiva ? "secondary" : "default"} aria-pressed={!categoriaAtiva}
        onClick={() => { setCategoriaId(""); setSubcategoriaId(""); }}>Todos</Button>
      {(expandido ? categorias : categorias.slice(0, 8)).map((categoria) => <Button key={categoria.id} className="min-h-11 px-4"
        variant={categoriaAtiva === categoria.id ? "default" : "secondary"} aria-pressed={categoriaAtiva === categoria.id}
        onClick={() => { setCategoriaId(categoria.id); setSubcategoriaId(""); }}>{categoria.nome}</Button>)}
      {categorias.length > 8 && <Button variant="ghost" className="min-h-11" aria-expanded={expandido} onClick={() => setExpandido(!expandido)}>
        {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{expandido ? "Ver menos" : "Ver todas"}
      </Button>}
    </div>
    {categoriaAtiva && subcategorias.length > 0 && <div className="mt-4 border-t pt-4">
      <p className="mb-2 text-sm font-semibold text-muted-foreground">Subcategorias</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Subcategorias">
        <Button className="min-h-11 px-4" variant={subcategoriaAtiva ? "secondary" : "default"} aria-pressed={!subcategoriaAtiva} onClick={() => setSubcategoriaId("")}>Todas</Button>
        {subcategorias.map((sub) => <Button key={sub.id} className="min-h-11 px-4" variant={subcategoriaAtiva === sub.id ? "default" : "secondary"}
          aria-pressed={subcategoriaAtiva === sub.id} onClick={() => setSubcategoriaId(sub.id)}>{sub.nome}</Button>)}
      </div>
    </div>}
    <div className="mt-7" aria-live="polite">
      {carregando ? <p className="py-8 text-muted-foreground">Carregando comércios…</p> : erro ? <EstadoVazio texto="Não foi possível carregar os comércios. Tente novamente em instantes." /> : grupos.length === 0 ? <EstadoVazio texto="Nenhum comércio encontrado." /> : <div className="grid gap-9">
        {grupos.map((grupo) => <section key={grupo.nome} aria-label={grupo.nome}>
          <div className="mb-4 flex items-baseline gap-3 border-b pb-3">
            <h2 className="font-display text-2xl font-bold">{grupo.nome}</h2>
            <span className="text-sm text-muted-foreground">{grupo.itens.length} {grupo.itens.length === 1 ? "comércio" : "comércios"}</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{grupo.itens.map(render)}</div>
        </section>)}
      </div>}
    </div>
  </div>;
}