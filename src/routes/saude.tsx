import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardItem } from "@/components/site/CardItem";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CAMPOS } from "@/lib/campos";
import { CATEGORIAS_SERVICOS_PUBLICOS } from "@/lib/nav";
import { linkWhatsapp, txt, useLista } from "@/lib/dados";

export const Route = createFileRoute("/saude")({
  head: () => ({
    meta: [
      { title: "Serviços Públicos do bairro Santa Regina" },
      {
        name: "description",
        content:
          "Escolas, postos de saúde, subprefeitura, praças, bibliotecas, centros esportivos e demais estruturas comunitárias de Santa Regina.",
      },
      { property: "og:title", content: "Serviços Públicos do bairro Santa Regina" },
      {
        property: "og:description",
        content: "Encontre escolas, postos de saúde, praças, bibliotecas e estruturas públicas de Santa Regina.",
      },
    ],
  }),
  component: Saude,
});

function linkInstagram(handle?: string | null) {
  if (!handle) return null;
  const limpo = handle.replace(/^@/, "").trim();
  if (!limpo) return null;
  return `https://instagram.com/${limpo}`;
}

function Saude() {
  const { data, isLoading } = useLista("comercios");
  const itens = (data ?? []).filter((item) =>
    CATEGORIAS_SERVICOS_PUBLICOS.includes(txt(item, "categoria")),
  );

  return (
    <div>
      <PageHero
        titulo="Serviços Públicos"
        subtitulo="A infraestrutura que serve a comunidade: escolas, postos de saúde, subprefeitura, praças, bibliotecas, centros esportivos e demais espaços coletivos do bairro."
        acao={
          <PublicarDialog
            tabela="comercios"
            rotulo="Cadastrar local"
            titulo="Cadastrar serviço público ou comunitário"
            descricao="Ajude os vizinhos indicando uma escola, posto de saúde, praça, biblioteca ou outro espaço público do bairro."
            campos={CAMPOS.comercios ?? []}
          />
        }
      />
      <Secao>
        <ListaFiltrada
          itens={itens}
          carregando={isLoading}
          categorias={CATEGORIAS_SERVICOS_PUBLICOS}
          campoCategoria="categoria"
          camposBusca={["nome", "descricao", "endereco", "categoria"]}
          vazio="Nenhum local cadastrado ainda. Cadastre a escola, praça ou posto de saúde que você conhece."
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
                ]}
                rodape={
                  wpp ? (
                    <Button asChild size="sm" variant="secondary">
                      <a href={wpp} target="_blank" rel="noreferrer">
                        WhatsApp
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
