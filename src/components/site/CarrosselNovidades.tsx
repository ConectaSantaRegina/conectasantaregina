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
      <section>
        <div className="mx-auto max-w-[1340px] px-4 pb-3 pt-7 text-center">
          <p className="flex items-center justify-center gap-2 font-display text-[1.6rem] font-extrabold text-primary">
            <Crown className="h-6 w-6" /> NOVIDADES
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              As publicações aprovadas com fotos aparecerão aqui em carrossel.
            </p>
            <Button asChild>
              <Link to="/novidades">Ver novidades do bairro</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mx-auto max-w-[1340px] px-4 pb-3 pt-7">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="flex items-center gap-2 font-display text-[1.6rem] font-extrabold text-primary">
            <Crown className="h-6 w-6" /> NOVIDADES
          </p>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[14px] border bg-card md:h-80">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${atual * 100}%)` }}
          >
            {destaques.map((item) => {
              return (
                <article key={item.id} className="w-full shrink-0">
                  <Link to="/novidades" className="grid h-full md:grid-cols-[55%_45%]">
                    <SiteImage
                      path={txt(item, "imagem_url")}
                      alt={txt(item, "titulo")}
                      className="aspect-[16/9] w-full md:h-80 md:aspect-auto"
                    />
                    <div className="flex min-w-0 flex-col p-5 md:p-6">
                      <Badge className="w-fit bg-accent text-accent-foreground hover:bg-accent">{txt(item, "categoria")}</Badge>
                      <h2 className="mt-3 line-clamp-2 font-display text-xl font-extrabold">
                        {txt(item, "titulo")}
                      </h2>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
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
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-foreground/40 text-primary-foreground transition hover:bg-foreground/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Próximo destaque"
                onClick={() => setAtual((i) => (i + 1) % total)}
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-foreground/40 text-primary-foreground transition hover:bg-foreground/60"
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
