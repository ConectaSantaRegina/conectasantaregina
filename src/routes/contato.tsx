import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale Conosco | Conecta Santa Regina" },
      { name: "description", content: "Entre em contato com o Conecta Santa Regina por WhatsApp ou e-mail e conheça os perfis grátis e Premium do portal do bairro." },
      { property: "og:title", content: "Fale Conosco | Conecta Santa Regina" },
      { property: "og:description", content: "Conheça o projeto, os perfis grátis e Premium e fale com a equipe do Conecta Santa Regina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <section className="mx-auto grid max-w-[1340px] items-start gap-7 px-4 pb-3 pt-7 lg:grid-cols-2">
      <div className="min-w-0">
        <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">Fale Conosco</h1>
        <div className="surface-card mt-7 p-5 md:p-6">
          <h2 className="font-display text-xl font-bold text-primary">Quer ser Premium?</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Quer ser Premium ou tem alguma dúvida? Entre em contato conosco através dos canais abaixo:
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="max-w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <a href="https://wa.me/5511987654321?text=Olá! Gostaria de saber mais sobre o plano Premium do Conecta Santa Regina." target="_blank" rel="noopener noreferrer">
                Nos chame no WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="mailto:conectasantaregina@gmail.com?subject=Interesse em Premium - Conecta Santa Regina">
                Envie um e-mail
              </a>
            </Button>
          </div>
        </div>
      </div>

      <aside className="surface-card min-w-0 p-5 md:p-6">
        <h2 className="font-display text-xl font-bold text-primary">Sobre o Conecta Santa Regina</h2>
        <div className="mt-3 space-y-4 text-base text-muted-foreground">
          <p><strong className="font-semibold">O que é?</strong> Um espaço digital feito por moradores, para moradores do bairro Santa Regina.</p>
          <p><strong className="font-semibold">Para que serve?</strong> Conectar a comunidade, compartilhar informações sobre comércio, saúde, empregos, imóveis, novidades e ações solidárias do bairro.</p>
        </div>

        <h3 className="mt-5 font-sans text-base font-semibold">Perfil Grátis</h3>
        <ul className="mt-3 text-base text-muted-foreground">
          <li>✓ Qualquer morador pode usar</li>
          <li>✓ Cadastrar comércios, serviços, vagas, imóveis, melhorias e doações</li>
          <li>✓ Visualizar tudo que é publicado</li>
          <li>✓ Sem custos</li>
        </ul>

        <h3 className="mt-5 font-sans text-base font-semibold">Perfil Premium</h3>
        <ul className="mt-3 text-base text-muted-foreground">
          <li>✓ Para comerciantes e prestadores de serviços</li>
          <li>✓ Publicar no Feed e Novidades</li>
          <li>✓ Maior visibilidade</li>
          <li>✓ Taxa mensal de R$ 25,00</li>
        </ul>
        <p className="mt-4 text-sm italic text-muted-foreground">
          Todas as publicações estarão sujeitas à aprovação do administrador.
        </p>
      </aside>
    </section>
  );
}
