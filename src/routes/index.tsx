import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store,
  HeartPulse,
  Briefcase,
  Home,
  Megaphone,
  Lightbulb,
  HandHeart,
  Mail,
  ArrowRight,
} from "lucide-react";
import heroBairro from "@/assets/hero-bairro.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteImage } from "@/components/site/SiteImage";
import { Secao } from "@/components/site/PageHero";
import { formatarData, txt, useLista } from "@/lib/dados";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conecta Santa Regina — o guia do nosso bairro" },
      {
        name: "description",
        content:
          "Comércio, delivery, farmácias, postos de saúde, vagas de emprego, novidades e ações comunitárias do bairro Santa Regina em um só lugar.",
      },
      { property: "og:title", content: "Conecta Santa Regina — o guia do nosso bairro" },
      {
        property: "og:description",
        content:
          "Encontre comércios, serviços de saúde, vagas, imóveis, novidades e ações da comunidade de Santa Regina.",
      },
    ],
  }),
  component: Inicio,
});

const ATALHOS = [
  {
    to: "/comercio",
    label: "Comércio e Delivery",
    texto: "Mercados, padarias, lanches e lojas do bairro",
    icone: Store,
  },
  {
    to: "/saude",
    label: "Saúde e Serviços",
    texto: "Farmácias, postos, clínicas e salões",
    icone: HeartPulse,
  },
  {
    to: "/empregos",
    label: "Balcão de Empregos",
    texto: "Vagas oferecidas aqui pertinho",
    icone: Briefcase,
  },
  {
    to: "/imoveis",
    label: "Aluguel e Venda",
    texto: "Casas, quartos, salas e terrenos",
    icone: Home,
  },
  {
    to: "/novidades",
    label: "Novidades",
    texto: "Promoções, obras, eventos e avisos",
    icone: Megaphone,
  },
  {
    to: "/melhorias",
    label: "Propor Melhorias",
    texto: "Sugira e apoie ideias para o bairro",
    icone: Lightbulb,
  },
  {
    to: "/acoes",
    label: "Doações e Ações",
    texto: "Mutirões, campanhas e solidariedade",
    icone: HandHeart,
  },
  {
    to: "/contato",
    label: "Fale Conosco",
    texto: "Mande uma mensagem para a gente",
    icone: Mail,
  },
] as const;

function Inicio() {
  const { data: novidades } = useLista("novidades", 3);
  const { data: comercios } = useLista("comercios", 6);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroBairro}
          alt="Rua do bairro Santa Regina no fim da tarde, com comércios e moradores conversando"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-36">
          <Badge className="bg-sun text-sun-foreground hover:bg-sun px-4 py-1.5 text-sm md:text-base font-semibold">Conecta Santa Regina</Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold text-primary-foreground md:text-6xl">
            Tudo o que o nosso bairro tem, em um só lugar
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/90 md:text-lg">
            O ponto de encontro digital de Santa Regina: comércio, delivery, saúde, empregos,
            novidades e as ações que a comunidade organiza junto.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/comercio">
                Ver o comércio do bairro <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/novidades">Novidades de hoje</Link>
            </Button>
          </div>
        </div>
      </section>

      <Secao>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">O que você procura?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ATALHOS.map((atalho) => (
            <Link
              key={atalho.to}
              to={atalho.to}
              className="surface-card group flex flex-col gap-3 p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <atalho.icone className="h-5 w-5" />
              </span>
              <span className="font-display text-base font-bold">{atalho.label}</span>
              <span className="text-sm text-muted-foreground">{atalho.texto}</span>
            </Link>
          ))}
        </div>
      </Secao>

      <section className="bg-secondary/50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <h2 className="min-w-0 font-display text-2xl font-extrabold md:text-3xl">
              Últimas novidades
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/novidades">Ver todas</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {(novidades ?? []).map((item) => (
              <article key={item.id} className="surface-card overflow-hidden">
                {txt(item, "imagem_url") ? (
                  <SiteImage
                    path={txt(item, "imagem_url")}
                    alt={txt(item, "titulo")}
                    className="aspect-[16/10] w-full"
                  />
                ) : null}
                <div className="p-5">
                  <Badge variant="secondary">{txt(item, "categoria")}</Badge>
                  <h3 className="mt-3 font-display text-lg font-bold">{txt(item, "titulo")}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {txt(item, "texto")}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatarData(item.created_at)}
                  </p>
                </div>
              </article>

            ))}
            {(novidades ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ainda não há novidades publicadas. Seja a primeira pessoa a contar o que está
                acontecendo no bairro.
              </p>
            )}
          </div>
        </div>
      </section>

      <Secao>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 className="min-w-0 font-display text-2xl font-extrabold md:text-3xl">
            Comércios cadastrados
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/comercio">Ver todos</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(comercios ?? []).map((item) => (
            <div key={item.id} className="surface-card p-5">
              <Badge variant="secondary">{txt(item, "categoria")}</Badge>
              <h3 className="mt-3 font-display text-base font-bold">{txt(item, "nome")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{txt(item, "endereco")}</p>
            </div>

          ))}
          {(comercios ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum comércio cadastrado ainda. Se você tem um negócio no bairro, cadastre
              gratuitamente.
            </p>
          )}
        </div>
      </Secao>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="surface-card grid gap-4 p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold">
              Tem uma ideia para melhorar Santa Regina?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Publique sua sugestão, veja o que os vizinhos propuseram e apoie as ideias que você
              também quer ver acontecendo.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/melhorias">Propor melhoria</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
