import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Instagram, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardItem } from "@/components/site/CardItem";
import { LinkEndereco } from "@/components/site/LinkEndereco";
import { ListaComercios } from "@/components/site/ListaComercios";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { camposLocal } from "@/lib/campos";
import { classificarComercios, useTaxonomiaComercio } from "@/lib/taxonomia-comercio";
import { bool, linkWhatsapp, txt, useLista } from "@/lib/dados";

export const Route = createFileRoute("/comercio")({
  head: () => ({
    meta: [
      { title: "Comércio e Serviços do bairro Santa Regina" },
      {
        name: "description",
        content:
          "Mercados, farmácias, restaurantes, bancos, academias, salões e demais comércios e serviços privados do bairro Santa Regina.",
      },
      { property: "og:title", content: "Comércio e Serviços do bairro Santa Regina" },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "O guia completo dos comércios e serviços privados do bairro Santa Regina.",
      },
    ],
  }),
  component: Comercio,
});

function linkInstagram(handle?: string | null) {
  if (!handle) return null;
  const limpo = handle.replace(/^@/, "").trim();
  if (!limpo) return null;
  return `https://instagram.com/${limpo}`;
}

function Comercio() {
  const { data, isLoading, isError } = useLista("comercios");
  const taxonomia = useTaxonomiaComercio();
  const itens = classificarComercios((data ?? []).filter((item) => txt(item, "secao") !== "publico"), taxonomia.data?.categorias ?? [], taxonomia.data?.vinculos ?? []);

  return (
    <div>
      <PageHero
        titulo="Comércio e Serviços"
        subtitulo="Quem trabalha aqui no bairro merece ser encontrado. Veja mercados, farmácias, restaurantes, bancos, academias, salões e demais negócios de Santa Regina."
        acao={
          <PublicarDialog
            tabela="comercios"
            rotulo="Cadastrar comércio"
            titulo="Cadastrar comércio ou serviço"
            descricao="Preencha os dados do seu negócio para aparecer no guia do bairro."
            campos={camposLocal("comercio")}
            extra={{ secao: "comercio" }}
          />
        }
      />
      <Secao>
        <ListaComercios
          itens={itens}
          carregando={isLoading || taxonomia.isLoading}
          erro={isError || taxonomia.isError}
          render={({ registro: item, categoria, subcategorias }) => {
            const wpp = linkWhatsapp(txt(item, "whatsapp"));
            const ig = linkInstagram(txt(item, "instagram"));
            return (
              <CardItem
                key={item.id}
                registro={item}
                tabela="comercios"
                titulo={txt(item, "nome")}
                badge={categoria?.nome ?? txt(item, "categoria")}
                imagem={txt(item, "imagem_url") || null}
                descricao={txt(item, "descricao") || null}
                infos={[
                  ...(subcategorias.length ? [{ icone: null, texto: subcategorias.map((sub) => sub.nome).join(" • ") }] : []),
                  ...(txt(item, "endereco")
                    ? [
                        {
                          icone: <MapPin className="h-4 w-4" />,
                          texto: <LinkEndereco endereco={txt(item, "endereco")} />,
                        },
                      ]
                    : []),
                  ...(txt(item, "horario")
                    ? [{ icone: <Clock className="h-4 w-4" />, texto: txt(item, "horario") }]
                    : []),
                  ...(txt(item, "telefone")
                    ? [{ icone: <Phone className="h-4 w-4" />, texto: txt(item, "telefone") }]
                    : []),
                  ...(ig
                    ? [
                        {
                          icone: <Instagram className="h-4 w-4" />,
                          texto: (
                            <a
                              href={ig}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline hover:text-primary/80"
                            >
                              @{txt(item, "instagram").replace(/^@/, "")}
                            </a>
                          ),
                        },
                      ]
                    : []),
                  ...(bool(item, "delivery")
                    ? [{ icone: <Bike className="h-4 w-4" />, texto: "Faz entrega no bairro" }]
                    : []),
                ]}
                rodape={
                  wpp ? (
                    <Button asChild size="sm">
                      <a href={wpp} target="_blank" rel="noreferrer">
                        Chamar no WhatsApp
                      </a>
                    </Button>
                  ) : null
                }
              />
            );
          }}
        />
      </Secao>
    </div>
  );
}
