import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Target, Phone } from "lucide-react";
import { CardItem } from "@/components/site/CardItem";
import { LinkEndereco } from "@/components/site/LinkEndereco";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CAMPOS } from "@/lib/campos";
import { txt, useLista } from "@/lib/dados";

const TIPOS = ["Doação", "Mutirão", "Campanha", "Evento solidário", "Voluntariado"];

export const Route = createFileRoute("/acoes")({
  head: () => ({
    meta: [
      { title: "Doações e Ações Comunitárias em Santa Regina" },
      {
        name: "description",
        content:
          "Campanhas de doação, mutirões e ações voluntárias organizadas pelos moradores do bairro Santa Regina.",
      },
      { property: "og:title", content: "Doações e Ações Comunitárias em Santa Regina" },
      {
        property: "og:description",
        content: "Participe das campanhas e mutirões da comunidade de Santa Regina.",
      },
    ],
  }),
  component: Acoes,
});

function Acoes() {
  const { data, isLoading } = useLista("acoes");

  return (
    <div>
      <PageHero
        titulo="Doações e Ações"
        subtitulo="Mutirões, campanhas de agasalho, arrecadação de alimentos e tudo o que a comunidade faz junto."
        acao={
          <PublicarDialog
            tabela="acoes"
            rotulo="Criar ação"
            titulo="Criar uma ação comunitária"
            descricao="Descreva a ação, a meta e como as pessoas podem participar ou doar."
            campos={CAMPOS.acoes ?? []}
          />
        }
      />
      <Secao>
        <ListaFiltrada
          itens={data ?? []}
          carregando={isLoading}
          categorias={TIPOS}
          campoCategoria="tipo"
          camposBusca={["titulo", "descricao", "local"]}
          vazio="Nenhuma ação em andamento. Organize a primeira campanha do bairro."
          render={(item) => (
            <CardItem
              key={item.id}
              registro={item}
              tabela="acoes"
              titulo={txt(item, "titulo")}
              badge={txt(item, "tipo")}
              imagem={txt(item, "imagem_url") || null}
              descricao={txt(item, "descricao") || null}
              infos={[
                ...(txt(item, "meta")
                  ? [{ icone: <Target className="h-4 w-4" />, texto: txt(item, "meta") }]
                  : []),
                ...(txt(item, "local")
                  ? [{
                        icone: <MapPin className="h-4 w-4" />,
                        texto: <LinkEndereco endereco={txt(item, "local")} />,
                      }]
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
