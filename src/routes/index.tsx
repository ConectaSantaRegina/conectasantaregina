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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteImage } from "@/components/site/SiteImage";
import { Secao } from "@/components/site/PageHero";
import { RuaBairro, Onda } from "@/components/site/RuaBairro";
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
      <section className="relative overflow-hidden pt-14 pb-8 md:pt-16">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Bairro Santa Regina</p>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold">
              Tudo o que o nosso
              <br />
              <em className="font-semibold not-italic italic text-mango-deep">bairro oferece</em>,
              <br />
              num só lugar.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
              Comércio local, delivery, farmácias, saúde, salões, vagas de emprego, novidades e um
              espaço pra gente propor melhorias juntos. Feito por quem mora aqui, pra quem mora
              aqui.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <Button asChild size="lg">
                <Link to="/comercio">
                  <Store className="h-4 w-4" /> Ver comércios
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/melhorias">
                  <Lightbulb className="h-4 w-4" /> Propor uma ideia
                </Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-2.5">
              {[
                { icone: Store, texto: "Achados do bairro" },
                { icone: HandHeart, texto: "Feito pela comunidade" },
                { icone: Megaphone, texto: "Atualizado toda semana" },
              ].map((chip) => (
                <span
                  key={chip.texto}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[0.82rem] font-semibold text-muted-foreground"
                >
                  <chip.icone className="h-4 w-4" /> {chip.texto}
                </span>
              ))}
            </div>
          </div>

          <div className="order-first md:order-none">
            <RuaBairro />
          </div>
        </div>
      </section>

      <Onda variante="para-fundo" />

      <section className="bg-secondary py-12 md:py-16">
        <div className="mx-auto max-w-[1180px] px-5">
          <p className="eyebrow">Atalhos</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-bold">
            O que você procura?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ATALHOS.map((atalho) => (
              <Link
                key={atalho.to}
                to={atalho.to}
                className="surface-card lift-hover flex flex-col gap-3 p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <atalho.icone className="h-5 w-5" />
                </span>
                <span className="font-display text-base font-semibold">{atalho.label}</span>
                <span className="text-sm text-muted-foreground">{atalho.texto}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Onda variante="para-papel" />

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-[1180px] px-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Novidades</p>
              <h2 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-bold">
                O que está acontecendo agora
              </h2>
            </div>
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
