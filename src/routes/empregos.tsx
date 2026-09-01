import { createFileRoute } from "@tanstack/react-router";
import { Building2, Wallet, Phone } from "lucide-react";
import { CardItem } from "@/components/site/CardItem";
import { ListaFiltrada } from "@/components/site/ListaFiltrada";
import { PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CAMPOS } from "@/lib/campos";
import { txt, useLista } from "@/lib/dados";

const TIPOS = ["Efetivo", "Temporário", "Freelance", "Estágio", "Bico"];

export const Route = createFileRoute("/empregos")({
  head: () => ({
    meta: [
      { title: "Balcão de Empregos de Santa Regina" },
      {
        name: "description",
        content:
          "Vagas de trabalho, bicos e serviços oferecidos por comerciantes e moradores do bairro Santa Regina.",
      },
      { property: "og:title", content: "Balcão de Empregos de Santa Regina" },
      {
        property: "og:description",
        content: "Vagas e oportunidades de trabalho aqui pertinho, no bairro Santa Regina.",
      },
    ],
  }),
  component: Empregos,
});

function Empregos() {
  const { data, isLoading } = useLista("vagas");

  return (
    <div>
      <PageHero
        titulo="Balcão de Empregos"
        subtitulo="Vagas, bicos e oportunidades oferecidas por quem é do bairro. Trabalho perto de casa, sem gastar com transporte."
        acao={
          <PublicarDialog
            tabela="vagas"
            rotulo="Publicar vaga"
            titulo="Publicar uma vaga"
            descricao="Descreva a oportunidade e como as pessoas devem entrar em contato."
            campos={CAMPOS.vagas ?? []}
          />
        }
      />
      <Secao>
        <ListaFiltrada
          itens={data ?? []}
          carregando={isLoading}
          categorias={TIPOS}
          campoCategoria="tipo"
          camposBusca={["titulo", "empresa", "descricao"]}
          vazio="Nenhuma vaga publicada no momento. Se você precisa de ajuda no seu negócio, publique aqui."
          render={(item) => (
            <CardItem
              key={item.id}
              registro={item}
              tabela="vagas"
              titulo={txt(item, "titulo")}
              badge={txt(item, "tipo")}
              descricao={txt(item, "descricao") || null}
              infos={[
                ...(txt(item, "empresa")
                  ? [{ icone: <Building2 className="h-4 w-4" />, texto: txt(item, "empresa") }]
                  : []),
                ...(txt(item, "salario")
                  ? [{ icone: <Wallet className="h-4 w-4" />, texto: txt(item, "salario") }]
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
