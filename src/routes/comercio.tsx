import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Instagram, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardItem } from "@/components/site/CardItem";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { camposLocal } from "@/lib/campos";
import { CATEGORIAS_COMERCIO } from "@/lib/nav";
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
  const { data, isLoading } = useLista("comercios");
  const itens = (data ?? []).filter((item) => txt(item, "secao") !== "publico");

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
        <ListaFiltrada
          itens={itens}
          carregando={isLoading}
          categorias={CATEGORIAS_COMERCIO}
          campoCategoria="categoria"
          camposBusca={["nome", "descricao", "endereco", "categoria"]}
          vazio="Nenhum comércio encontrado. Que tal cadastrar o primeiro?"
          render={(item) => {
            const wpp = linkWhatsapp(txt(item, "whatsapp"));
            const ig = linkInstagram(txt(item, "instagram"));
            return (
              <CardItem
                key={item.id}
                registro={item}
                tabela="comercios"
                titulo={txt(item, "nome")}
                badge={txt(item, "categoria")}
                imagem={txt(item, "imagem_url") || null}
                descricao={txt(item, "descricao") || null}
                infos={[
                  ...(txt(item, "endereco")
                    ? [{ icone: <MapPin className="h-4 w-4" />, texto: txt(item, "endereco") }]
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
