import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Tag, Phone } from "lucide-react";
import { CardItem } from "@/components/site/CardItem";
import { LinkEndereco } from "@/components/site/LinkEndereco";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CAMPOS } from "@/lib/campos";
import { txt, useLista } from "@/lib/dados";

const FINALIDADES = ["Aluguel", "Venda"];
const TIPOS = ["Casa", "Apartamento", "Quarto", "Sala comercial", "Terreno", "Galpão"];

export const Route = createFileRoute("/imoveis")({
  head: () => ({
    meta: [
      { title: "Aluguel e Venda em Santa Regina" },
      {
        name: "description",
        content:
          "Casas, apartamentos, quartos, salas comerciais e terrenos para alugar ou comprar no bairro Santa Regina.",
      },
      { property: "og:title", content: "Aluguel e Venda em Santa Regina" },
      {
        property: "og:description",
        content: "Imóveis para alugar e vender anunciados por moradores do bairro Santa Regina.",
      },
    ],
  }),
  component: Imoveis,
});

function Imoveis() {
  const { data, isLoading } = useLista("imoveis");

  return (
    <div>
      <PageHero
        titulo="Aluguel e Venda"
        subtitulo="Anúncios de moradores para moradores: casas, quartos, salas e terrenos aqui no Santa Regina."
        acao={
          <PublicarDialog
            tabela="imoveis"
            rotulo="Anunciar imóvel"
            titulo="Anunciar um imóvel"
            descricao="Conte os detalhes do imóvel e como falar com você."
            campos={CAMPOS.imoveis ?? []}
          />
        }
      />
      <Secao>
        <ListaFiltrada
          itens={data ?? []}
          carregando={isLoading}
          categorias={FINALIDADES}
          campoCategoria="finalidade"
          camposBusca={["titulo", "descricao", "endereco", "tipo"]}
          vazio="Nenhum imóvel anunciado ainda. Publique o seu gratuitamente."
          render={(item) => (
            <CardItem
              key={item.id}
              registro={item}
              tabela="imoveis"
              titulo={txt(item, "titulo")}
              badge={`${txt(item, "finalidade")} • ${txt(item, "tipo")}`}
              imagem={txt(item, "imagem_url") || null}
              descricao={txt(item, "descricao") || null}
              infos={[
                ...(txt(item, "preco")
                  ? [{ icone: <Tag className="h-4 w-4" />, texto: txt(item, "preco") }]
                  : []),
                ...(txt(item, "endereco")
                  ? [
                      {
                        icone: <MapPin className="h-4 w-4" />,
                        texto: <LinkEndereco endereco={txt(item, "endereco")} />,
                      },
                    ]
                  : []),
                ...(txt(item, "contato")
                  ? [{ icone: <Phone className="h-4 w-4" />, texto: txt(item, "contato") }]
                  : []),
              ]}
            />
          )}
        />
      </Secao>
    </div>
  );
}
