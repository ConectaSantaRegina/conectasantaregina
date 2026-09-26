import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteImage } from "@/components/site/SiteImage";
import { formatarData, txt, useDestaquesPremium } from "@/lib/dados";

export function CarrosselNovidades() {
  const { data: novidades } = useDestaquesPremium();
  const [atual, setAtual] = useState(0);

  const destaques = novidades ?? [];
  const total = destaques.length;

  useEffect(() => {
    if (total < 2) return;
    const id = window.setInterval(() => setAtual((i) => (i + 1) % total), 6000);
    return () => window.clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (atual >= total) setAtual(0);
  }, [atual, total]);

  if (total === 0) {
    return (
      <section className="border-b bg-secondary/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Crown className="h-4 w-4" /> Novidades do bairro
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              As publicações aprovadas com fotos aparecerão aqui em carrossel.
            </p>
          </div>
          <Button asChild>
            <Link to="/novidades">Ver novidades do bairro</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="flex items-center gap-2 text-lg font-extrabold text-primary md:text-2xl">
            <Crown className="h-5 w-5 md:h-6 md:w-6" /> NOVIDADES
          </p>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${atual * 100}%)` }}
          >
            {destaques.map((item) => {
              return (
                <article key={item.id} className="w-full shrink-0">
                  <Link to="/novidades" className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <SiteImage
                      path={txt(item, "imagem_url")}
                      alt={txt(item, "titulo")}
                      className="aspect-[16/9] w-full md:aspect-[16/8] md:h-full"
                    />
                    <div className="p-5 md:p-8">
                      <Badge variant="secondary">{txt(item, "categoria")}</Badge>
                      <h2 className="mt-3 font-display text-xl font-extrabold md:text-3xl">
                        {txt(item, "titulo")}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground md:text-base">
                        {txt(item, "texto")}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatarData(item.created_at)}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {total > 1 ? (
            <>
              <button
                type="button"
                aria-label="Destaque anterior"
                onClick={() => setAtual((i) => (i - 1 + total) % total)}
                className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Próximo destaque"
                onClick={() => setAtual((i) => (i + 1) % total)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-background/80 px-3 py-1.5">
                {destaques.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Ir para destaque ${i + 1}`}
                    onClick={() => setAtual(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === atual ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
