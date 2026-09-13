import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
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
          "Promoções dos comerciantes, obras, eventos e avisos importantes do bairro Santa Regina, com fotos publicadas pelos moradores.",
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
  const { data, isLoading } = useLista("novidades");
  return (
    <div>
      <PageHero
        titulo="Novidades do bairro"
        subtitulo="Promoções, obras, eventos e avisos. Publique com foto para todo mundo ver o que está acontecendo em Santa Regina."
      />
      <Secao>
        <ListaFiltrada
          itens={data ?? []}
          carregando={isLoading}
          categorias={CATEGORIAS_NOVIDADES}
          campoCategoria="categoria"
          camposBusca={["titulo", "texto"]}
          vazio="Nenhuma novidade por aqui ainda. Publique a primeira promoção ou aviso do bairro."
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
