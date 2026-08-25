import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Instagram, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardItem } from "@/components/site/CardItem";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CATEGORIAS_COMERCIO } from "@/lib/nav";
import { bool, linkWhatsapp, txt, useLista } from "@/lib/dados";

export const Route = createFileRoute("/comercio")({
  head: () => ({
    meta: [
      { title: "Comércio e Delivery em Santa Regina" },
      {
        name: "description",
        content:
          "Mercados, padarias, lanchonetes, lojas e serviços com entrega no bairro Santa Regina. Encontre telefone, endereço e horário.",
      },
      { property: "og:title", content: "Comércio e Delivery em Santa Regina" },
      {
        property: "og:description",
        content: "O guia completo dos comércios e deliveries do bairro Santa Regina.",
      },
    ],
  }),
  component: Comercio,
});

function Comercio() {
  const { data, isLoading } = useLista("comercios");
  const itens = (data ?? []).filter((item) =>
    CATEGORIAS_COMERCIO.includes(txt(item, "categoria")),
  );

  return (
    <div>
      <PageHero
        titulo="Comércio e Delivery"
        subtitulo="Quem trabalha aqui no bairro merece ser encontrado. Veja tudo o que Santa Regina oferece e peça sem sair de casa."
        acao={
          <PublicarDialog
            tabela="comercios"
            rotulo="Cadastrar comércio"
            titulo="Cadastrar comércio"
            descricao="Preencha os dados do seu negócio para aparecer no guia do bairro."
            campos={[
              { name: "nome", label: "Nome do comércio", required: true },
              {
                name: "categoria",
                label: "Categoria",
                type: "select",
                options: CATEGORIAS_COMERCIO,
                required: true,
              },
              { name: "descricao", label: "Descrição", type: "textarea" },
              { name: "endereco", label: "Endereço" },
              { name: "horario", label: "Horário de funcionamento", type: "horarios", max: 400 },
              { name: "telefone", label: "Telefone" },
              { name: "whatsapp", label: "WhatsApp (só números)" },
              { name: "instagram", label: "Instagram (@)" },
              { name: "delivery", label: "Faz entrega (delivery)", type: "switch" },
              { name: "imagem_url", label: "Foto do comércio", type: "image" },
            ]}
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
                  ...(txt(item, "instagram")
                    ? [{ icone: <Instagram className="h-4 w-4" />, texto: txt(item, "instagram") }]
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
