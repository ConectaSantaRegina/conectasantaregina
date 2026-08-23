import type { ReactNode } from "react";

export function PageHero({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string;
  subtitulo: string;
  acao?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-secondary">
      <div className="mx-auto max-w-[1180px] px-5 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="min-w-0">
            <p className="eyebrow">Bairro Santa Regina</p>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-5xl">{titulo}</h1>
            <p className="mt-3 max-w-[52ch] text-base text-muted-foreground">{subtitulo}</p>
          </div>
          {acao && <div className="shrink-0">{acao}</div>}
        </div>
      </div>
    </section>
  );
}

export function Secao({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-[1180px] px-5 py-12 md:py-16">{children}</section>;
}


export function EstadoVazio({ texto }: { texto: string }) {
  return (
    <div className="surface-card grid place-items-center px-6 py-16 text-center">
      <p className="max-w-md text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}
