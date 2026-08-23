import { Link } from "@tanstack/react-router";
import { MapPinned } from "lucide-react";
import { NAV } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <MapPinned className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold">Conecta Santa Regina</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Um espaço feito por moradores, para moradores. Aqui você encontra o comércio do bairro,
            serviços de saúde, vagas de trabalho, novidades e as ações da nossa comunidade.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Navegue
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Feito com carinho pelo bairro Santa Regina
      </div>
    </footer>
  );
}
