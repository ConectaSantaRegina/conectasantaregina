import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero, Secao } from "@/components/site/PageHero";
import { linkWhatsapp } from "@/lib/dados";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale Conosco - Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Fale com a equipe do Conecta Santa Regina por WhatsApp ou e-mail e conheça os perfis Grátis e Premium do portal do bairro.",
      },
      { property: "og:title", content: "Fale Conosco - Conecta Santa Regina" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "Fale com a equipe do Conecta Santa Regina por WhatsApp ou e-mail e conheça os perfis Grátis e Premium do portal do bairro.",
      },
    ],
  }),
  component: Contato,
});

const ADMIN = "conectasantaregina@gmail.com";
const WHATSAPP = "47992928049";
const TEXTO_WA =
  "Olá! Gostaria de saber mais sobre ser Premium no Conecta Santa Regina.";

function Contato() {
  const wa = linkWhatsapp(WHATSAPP);

  return (
    <div>
      <PageHero titulo="Fale Conosco" subtitulo="" />
      <Secao>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="grid gap-6">
            <div className="surface-card grid gap-4 p-6 md:p-7">
              <h2 className="font-display text-lg font-bold text-primary">
                Quer ser Premium?
              </h2>
              <p className="text-sm text-muted-foreground">
                Quer ser Premium ou tem alguma dúvida? Entre em contato conosco
                através dos canais abaixo:
              </p>
              <div className="flex flex-wrap gap-3">
                {wa && (
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      Nos chame no WhatsApp
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <a
                    href={`mailto:${ADMIN}?subject=${encodeURIComponent(
                      "Dúvida sobre Premium - Conecta Santa Regina",
                    )}&body=${encodeURIComponent(TEXTO_WA)}`}
                  >
                    Envie um e-mail
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="surface-card grid gap-4 p-6 md:p-7">
            <h2 className="font-display text-lg font-bold text-primary">
              Sobre o Conecta Santa Regina
            </h2>
            <p className="text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">O que é?</strong>{" "}
              Um espaço digital feito por moradores, para moradores do bairro
              Santa Regina.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">Para que serve?</strong>{" "}
              Conectar a comunidade, compartilhar informações sobre comércio,
              saúde, empregos, imóveis, novidades e ações solidárias do bairro.
            </p>
            <div className="mt-1">
              <h3 className="font-display text-base font-bold">Perfil Grátis</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>✓ Qualquer morador pode usar</li>
                <li>✓ Cadastrar comércios, serviços, vagas, imóveis, melhorias e doações</li>
                <li>✓ Visualizar tudo que é publicado</li>
                <li>✓ Sem custos</li>
              </ul>
            </div>
            <div className="mt-1">
              <h3 className="font-display text-base font-bold">Perfil Premium</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>✓ Para comerciantes e prestadores de serviços</li>
                <li>✓ Publicar no Feed e Novidades</li>
                <li>✓ Maior visibilidade</li>
                <li>✓ Taxa mensal de R$ 25,00</li>
              </ul>
            </div>
            <p className="mt-1 text-xs italic text-muted-foreground">
              Todas as publicações estarão sujeitas a aprovação do administrador.
            </p>
          </div>
        </div>
      </Secao>
    </div>
  );
}
