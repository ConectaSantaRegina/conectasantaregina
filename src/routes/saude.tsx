import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardItem } from "@/components/site/CardItem";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CATEGORIAS_SAUDE } from "@/lib/nav";
import { linkWhatsapp, txt, useLista } from "@/lib/dados";

export const Route = createFileRoute("/saude")({
  head: () => ({
    meta: [
      { title: "Saúde e Serviços do bairro Santa Regina" },
      {
        name: "description",
        content:
          "Farmácias, postos de saúde, clínicas, odontologia, salões de beleza e academias do bairro Santa Regina com endereço e contato.",
      },
      { property: "og:title", content: "Saúde e Serviços do bairro Santa Regina" },
      {
        property: "og:description",
        content: "Onde encontrar farmácias, postos de saúde, clínicas e salões em Santa Regina.",
      },
    ],
  }),
  component: Saude,
});


function Saude() {
  const { data, isLoading } = useLista("comercios");
  const itens = (data ?? []).filter((item) => CATEGORIAS_SAUDE.includes(txt(item, "categoria")));

  return (
    <div>
      <PageHero
        titulo="Saúde e Serviços"
        subtitulo="A infraestrutura que cuida da gente: farmácias, postos de saúde, clínicas, odontologia, salões e academias do bairro."
        acao={
          <PublicarDialog
            tabela="comercios"
            rotulo="Cadastrar local"
            titulo="Cadastrar serviço de saúde ou beleza"
            descricao="Ajude os vizinhos indicando um local de saúde, beleza ou bem-estar do bairro."
            campos={[
              { name: "nome", label: "Nome do local", required: true },
              {
                name: "categoria",
                label: "Categoria",
                type: "select",
                options: CATEGORIAS_SAUDE,
                required: true,
              },
              { name: "descricao", label: "O que atende", type: "textarea" },
              { name: "endereco", label: "Endereço" },
              { name: "horario", label: "Horário de atendimento" },
              { name: "telefone", label: "Telefone" },
              { name: "whatsapp", label: "WhatsApp (só números)" },
              { name: "imagem_url", label: "Foto do local", type: "image" },
            ]}
          />
        }
      />
      <Secao>
        <ListaFiltrada
          itens={itens}
          carregando={isLoading}
          categorias={CATEGORIAS_SAUDE}
          campoCategoria="categoria"
          camposBusca={["nome", "descricao", "endereco", "categoria"]}
          vazio="Nenhum local cadastrado ainda. Cadastre a farmácia ou o posto de saúde que você conhece."
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
