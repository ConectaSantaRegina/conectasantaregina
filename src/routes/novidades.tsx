import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { usePremium } from "@/hooks/usePremium";
import { CAMPOS } from "@/lib/campos";
import { REGRA_CONTEUDO } from "@/lib/regras-publicacao";
import { CardItem } from "@/components/site/CardItem";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { CATEGORIAS_NOVIDADES } from "@/lib/nav";
import { bool, formatarData, txt, useLista } from "@/lib/dados";

export const Route = createFileRoute("/novidades")({
  head: () => ({
    meta: [
      { title: "Novidades e promoções de Santa Regina" },
      {
        name: "description",
        content:
          "Promoções, eventos e avisos do bairro Santa Regina, publicados por perfis Premium após aprovação da administração.",
      },
      { property: "og:title", content: "Novidades e promoções de Santa Regina" },
      {
        property: "og:description",
        content: "Fique por dentro das promoções, obras e eventos do bairro Santa Regina.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Novidades,
});

function Novidades() {
  const { podePublicarNovidades, carregando: carregandoPremium } = usePremium();
  const { data, isLoading } = useLista("novidades");
  const novidades = (data ?? []).filter((item) => txt(item, "canal") !== "feed");
  return (
    <div>
      <PageHero
        titulo="Novidades do bairro"
        subtitulo="Promoções, obras, eventos e avisos. Publicações de perfis Premium, sempre com aprovação da administração."
        acao={!carregandoPremium ? (
          podePublicarNovidades ? (
            <PublicarDialog
              tabela="novidades"
              rotulo="Publicar novidade"
              titulo="Publicar em Novidades"
              descricao="Sua publicação será analisada pela administração antes de aparecer em Novidades."
              campos={CAMPOS.novidades ?? []}
              extra={{ canal: "novidades" }}
              mensagemSucesso="Novidade enviada! Ela aparecerá após a aprovação da administração."
            />
          ) : (
            <Button asChild><Link to="/contato">Quero publicar em Novidades</Link></Button>
          )
        ) : undefined}
      />
      <Secao>
        <div className="mb-6 flex gap-2 border-y bg-accent/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="mb-1 font-semibold">Publicação exclusiva para perfis Premium. Todo envio depende da aprovação da administração.</p>
            <p>{REGRA_CONTEUDO}</p>
          </div>
        </div>
        <ListaFiltrada
          itens={novidades}
          carregando={isLoading}
          categorias={CATEGORIAS_NOVIDADES}
          campoCategoria="categoria"
          camposBusca={["titulo", "texto"]}
          vazio="Nenhuma novidade por aqui ainda. As publicações aprovadas aparecerão aqui."
          render={(item) => (
            <CardItem
              key={item.id}
              registro={item}
              tabela="novidades"
              titulo={txt(item, "titulo")}
              badge={
                bool(item, "aprovado")
                  ? txt(item, "categoria")
                  : "Aguardando aprovação"
              }
              imagem={txt(item, "imagem_url") || null}
              descricao={txt(item, "texto") || null}
              infos={[
                {
                  icone: <CalendarDays className="h-4 w-4" />,
                  texto: formatarData(item.created_at),
                },
              ]}
            />
          )}
        />
      </Secao>
    </div>
  );
}
