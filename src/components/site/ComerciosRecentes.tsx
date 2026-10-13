import { Link } from "@tanstack/react-router";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Secao } from "@/components/site/PageHero";
import { SiteImage } from "@/components/site/SiteImage";
import { txt, useLista } from "@/lib/dados";
import { classificarComercios, useTaxonomiaComercio } from "@/lib/taxonomia-comercio";

export function ComerciosRecentes() {
  const comercios = useLista("comercios");
  const taxonomia = useTaxonomiaComercio();
  const itens = classificarComercios((comercios.data ?? []).filter((item) => txt(item, "secao") === "comercio").slice(0, 6),
    taxonomia.data?.categorias ?? [], taxonomia.data?.vinculos ?? []);
  if (!itens.length) return null;
  return <Secao>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-extrabold">Novidades no bairro</h2>
      <Button asChild variant="ghost" className="min-h-11"><Link to="/comercio">Ver comércios<ArrowRight className="h-4 w-4" /></Link></Button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {itens.map(({ registro, categoria, subcategorias }) => <Link key={registro.id} to="/comercio" className="surface-card flex min-w-0 overflow-hidden transition-shadow hover:shadow-lift">
        {txt(registro, "imagem_url") ? <SiteImage path={txt(registro, "imagem_url")} alt={txt(registro, "nome")} className="w-24 shrink-0 self-stretch" /> : <div className="flex w-24 shrink-0 items-center justify-center bg-secondary"><Store className="h-7 w-7 text-primary" /></div>}
        <div className="min-w-0 p-4">
          <p className="text-xs font-semibold text-primary">{categoria?.nome ?? "Comércio e Serviços"}</p>
          <h3 className="mt-1 break-words font-display text-lg font-bold">{txt(registro, "nome")}</h3>
          <p className="mt-1 break-words text-sm text-muted-foreground">{subcategorias.map((sub) => sub.nome).join(" • ") || txt(registro, "categoria")}</p>
        </div>
      </Link>)}
    </div>
  </Secao>;
}