import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AcoesRegistro } from "@/components/site/CardItem";
import { PageHero, Secao, EstadoVazio } from "@/components/site/PageHero";
import { PedirDestaque, ListaPedidosDestaque } from "@/components/site/PedirDestaque";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteImage } from "@/components/site/SiteImage";
import { formatarData, txt, type Registro, type Tabela } from "@/lib/dados";

export const Route = createFileRoute("/minhas-publicacoes")({
  head: () => ({
    meta: [
      { title: "Minhas publicações — Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Painel do comerciante: veja, edite e remova tudo o que você publicou no Conecta Santa Regina.",
      },
      { property: "og:title", content: "Minhas publicações — Conecta Santa Regina" },
      {
        property: "og:description",
        content: "Gerencie seus comércios, novidades, vagas e anúncios do bairro Santa Regina.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinhasPublicacoes,
});

const GRUPOS: { tabela: Tabela; rotulo: string; campoTitulo: string; rota: string }[] = [
  { tabela: "comercios", rotulo: "Comércios e serviços", campoTitulo: "nome", rota: "/comercio" },
  { tabela: "novidades", rotulo: "Novidades e promoções", campoTitulo: "titulo", rota: "/novidades" },
  { tabela: "vagas", rotulo: "Vagas de emprego", campoTitulo: "titulo", rota: "/empregos" },
  { tabela: "imoveis", rotulo: "Aluguel e venda", campoTitulo: "titulo", rota: "/imoveis" },
  { tabela: "acoes", rotulo: "Doações e ações", campoTitulo: "titulo", rota: "/acoes" },
  { tabela: "sugestoes", rotulo: "Propostas de melhoria", campoTitulo: "titulo", rota: "/melhorias" },
];

function useMinhasPublicacoes(userId?: string) {
  return useQuery({
    queryKey: ["minhas-publicacoes", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const resultados = await Promise.all(
        GRUPOS.map(async (grupo) => {
          const { data, error } = await supabase
            .from(grupo.tabela as "comercios")
            .select("*")
            .eq("user_id", userId!)
            .order("created_at", { ascending: false });
          if (error) throw error;
          return { grupo, itens: (data ?? []) as unknown as Registro[] };
        }),
      );
      return resultados;
    },
  });
}

function MinhasPublicacoes() {
  const { user, loading } = useAuth();
  const { data, isLoading } = useMinhasPublicacoes(user?.id);
  const total = (data ?? []).reduce((soma, g) => soma + g.itens.length, 0);

  return (
    <div>
      <PageHero
        titulo="Minhas publicações"
        subtitulo="Tudo o que você publicou no bairro em um só lugar: revise, atualize os dados e remova o que não está mais valendo."
        acao={<PedirDestaque />}
      />
      <Secao>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !user ? (
          <div className="surface-card grid gap-4 p-8 text-center">
            <h2 className="font-display text-xl font-bold">Entre para ver suas publicações</h2>
            <p className="text-sm text-muted-foreground">
              Você precisa estar conectada(o) na sua conta para gerenciar seus cadastros.
            </p>
            <div>
              <Button asChild>
                <Link to="/entrar">Entrar / Criar conta</Link>
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando suas publicações…</p>
        ) : total === 0 ? (
          <div className="grid gap-10">
            <EstadoVazio texto="Você ainda não publicou nada. Comece cadastrando seu comércio ou uma promoção." />
            <ListaPedidosDestaque />
          </div>
        ) : (
          <div className="grid gap-10">
            {(data ?? [])
              .filter((g) => g.itens.length > 0)
              .map(({ grupo, itens }) => (
                <section key={grupo.tabela} className="grid gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold">
                      {grupo.rotulo}{" "}
                      <span className="text-sm font-medium text-muted-foreground">
                        ({itens.length})
                      </span>
                    </h2>
                    <Button asChild variant="outline" size="sm">
                      <Link to={grupo.rota}>Ver a página</Link>
                    </Button>
                  </div>
                  <ul className="grid gap-3">
                    {itens.map((item) => {
                      const imagem = txt(item, "imagem_url");
                      return (
                        <li
                          key={item.id}
                          className="surface-card flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap"
                        >
                          {imagem ? (
                            <SiteImage
                              path={imagem}
                              alt={txt(item, grupo.campoTitulo)}
                              className="h-16 w-24 shrink-0 overflow-hidden rounded-xl"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">
                              {txt(item, grupo.campoTitulo) || "Sem título"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {(txt(item, "categoria") || txt(item, "tipo")) && (
                                <Badge variant="secondary">
                                  {txt(item, "categoria") || txt(item, "tipo")}
                                </Badge>
                              )}
                              {txt(item, "status") && <Badge>{txt(item, "status")}</Badge>}
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatarData(item.created_at)}
                              </span>
                            </div>
                          </div>
                          <AcoesRegistro registro={item} tabela={grupo.tabela} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            <ListaPedidosDestaque />
          </div>
        )}
      </Secao>
    </div>
  );
}
