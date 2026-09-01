import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store,
  Landmark,
  Briefcase,
  Home,
  Megaphone,
  Lightbulb,
  HandHeart,
  Mail,
} from "lucide-react";
import heroBairro from "@/assets/hero-bairro.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarrosselNovidades } from "@/components/site/CarrosselNovidades";
import { Secao } from "@/components/site/PageHero";

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
    label: "Comércio e Serviços",
    texto: "Mercados, farmácias, restaurantes, bancos, academias e lojas",
    icone: Store,
  },
  {
    to: "/saude",
    label: "Serviços Públicos",
    texto: "Escolas, postos de saúde, praças, bibliotecas e subprefeitura",
    icone: Landmark,
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
          <Badge className="bg-sun text-sun-foreground hover:bg-sun px-5 py-2 text-lg md:text-2xl font-extrabold tracking-tight">
            Conecta Santa Regina
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold text-primary-foreground md:text-6xl">
            Tudo o que o nosso bairro tem, em um só lugar
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-foreground/90 md:text-lg">
            O ponto de encontro digital de Santa Regina: comércio, delivery, saúde, empregos,
            novidades e as ações que a comunidade organiza junto.
          </p>
        </div>
      </section>

      <CarrosselNovidades />

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

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="surface-card grid gap-4 p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold">Tem algo para publicar?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre-se para postar novidades, ofertas e avisos para todo o bairro.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/entrar">Cadastre-se</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
