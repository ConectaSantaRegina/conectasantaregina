import { createFileRoute, Link } from "@tanstack/react-router";
import {
} from "lucide-react";
import heroBairro from "@/assets/hero-bairro.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarrosselNovidades } from "@/components/site/CarrosselNovidades";
import { FeedComunidade } from "@/components/site/FeedComunidade";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
       { property: "og:image", content: "https://www.conectasantaregina.com.br/conecta-santa-regina.jpg" },
       { name: "twitter:image", content: "https://www.conectasantaregina.com.br/conecta-santa-regina.jpg" },
    ],
  }),
  component: Inicio,
});

const ATALHOS = [
  {
    to: "/comercio",
    label: "Comércio e Serviços",
    texto: "Mercados, farmácias, restaurantes, bancos, academias e lojas",
  },
  {
    to: "/saude",
    label: "Serviços Públicos",
    texto: "Escolas, postos de saúde, praças, bibliotecas e subprefeitura",
  },
  {
    to: "/empregos",
    label: "Balcão de Empregos",
    texto: "Vagas oferecidas aqui pertinho",
  },
  {
    to: "/imoveis",
    label: "Aluguel e Venda",
    texto: "Casas, quartos, salas e terrenos",
  },
  {
    to: "/novidades",
    label: "Novidades",
    texto: "Promoções, obras, eventos e avisos",
  },
  {
    to: "/melhorias",
    label: "Propor Melhorias",
    texto: "Sugira e apoie ideias para o bairro",
  },
  {
    to: "/acoes",
    label: "Doações e Ações",
    texto: "Mutirões, campanhas e solidariedade",
  },
  {
    to: "/contato",
    label: "Fale Conosco",
    texto: "Mande uma mensagem para a gente",
  },
] as const;

function Inicio() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-[var(--hero-shade)] text-primary-foreground">
        <img
          src={heroBairro}
          alt="Rua do bairro Santa Regina no fim da tarde, com comércios e moradores conversando"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover object-center md:object-right"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-[1340px] px-4 py-[90px] md:py-[110px]">
          <Badge className="rounded-xl bg-accent px-5 py-2.5 font-display text-xl font-extrabold text-accent-foreground hover:bg-accent">
            Conecta Santa Regina
          </Badge>
          <h1 className="mt-5 max-w-[13em] font-display text-4xl font-extrabold text-primary-foreground md:text-6xl">
            Tudo o que o nosso bairro tem, em um só lugar
          </h1>
          <p className="mt-4 max-w-[56ch] text-base text-primary-foreground/90 md:text-[1.1rem]">
            O ponto de encontro digital de Santa Regina: comércio, delivery, saúde, empregos,
            novidades e as ações que a comunidade organiza junto.
          </p>
          <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/novidades">Ver novidades do bairro</Link>
          </Button>
        </div>
      </section>

      <CarrosselNovidades />

      <FeedComunidade />

      <Secao>
        <h2 className="font-display text-[1.6rem] font-extrabold">O que você procura?</h2>
        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {ATALHOS.map((atalho) => (
            <Link
              key={atalho.to}
              to={atalho.to}
              className="group block rounded-[10px] border border-l-[6px] border-l-accent bg-card p-4 text-foreground transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span className="block font-display text-[1.1rem] font-bold">{atalho.label}</span>
              <span className="mt-1 block text-[0.92rem] text-muted-foreground">{atalho.texto}</span>
            </Link>
          ))}
        </div>
      </Secao>

      <section className="mx-auto mt-6 max-w-[1340px] px-4 pb-3">
        <div className="rounded-[14px] bg-card p-7 text-center md:p-9">
          <h2 className="font-display text-[1.6rem] font-extrabold">Tem algo para publicar?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Cadastrar comércio, vagas e imóveis é gratuito. Para publicar no Feed e em Novidades é preciso ser Premium. Tudo passa pela aprovação da administração.
          </p>
          <Button asChild size="lg" className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/entrar">Cadastre-se</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
