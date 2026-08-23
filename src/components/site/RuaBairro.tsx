import { Link } from "@tanstack/react-router";

/**
 * Ilustração da rua do bairro: cada prédio é um atalho para uma seção do site.
 */
const PREDIOS = [
  { to: "/comercio", label: "Comércio" },
  { to: "/comercio", label: "Delivery" },
  { to: "/saude", label: "Saúde" },
  { to: "/saude", label: "Beleza" },
  { to: "/empregos", label: "Empregos" },
  { to: "/melhorias", label: "Participe" },
] as const;

export function RuaBairro() {
  return (
    <div>
      <svg
        viewBox="0 0 420 300"
        className="h-[220px] w-full md:h-[300px]"
        role="img"
        aria-label="Ilustração de uma rua do bairro Santa Regina com prédios que levam às seções do site"
      >
        <ellipse cx="210" cy="272" rx="205" ry="14" className="fill-paper-deep" />

        <g className="[&>g]:transition-transform">
          <g className="hover:-translate-y-1.5">
            <rect x="10" y="140" width="70" height="120" rx="8" className="fill-mango" />
            <rect x="20" y="200" width="18" height="60" className="fill-card opacity-85" />
            <rect x="46" y="200" width="18" height="60" className="fill-card opacity-85" />
            <rect x="10" y="128" width="70" height="16" rx="6" className="fill-brick" />
          </g>
          <g className="hover:-translate-y-1.5">
            <rect x="88" y="165" width="58" height="95" rx="8" className="fill-sun" />
            <circle cx="117" cy="205" r="14" className="fill-card opacity-90" />
            <path
              d="M110 205h14M117 198v14"
              className="stroke-sun-foreground"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
          <g className="hover:-translate-y-1.5">
            <rect x="154" y="115" width="76" height="145" rx="8" className="fill-teal" />
            <rect x="180" y="150" width="24" height="24" className="fill-card opacity-90" />
            <path
              d="M192 156v12M186 162h12"
              className="stroke-teal-deep"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="170" y="200" width="20" height="60" className="fill-card opacity-20" />
            <rect x="196" y="200" width="20" height="60" className="fill-card opacity-20" />
          </g>
          <g className="hover:-translate-y-1.5">
            <rect x="238" y="175" width="56" height="85" rx="8" className="fill-brick opacity-70" />
            <circle cx="266" cy="210" r="12" className="fill-card opacity-90" />
          </g>
          <g className="hover:-translate-y-1.5">
            <rect x="304" y="150" width="60" height="110" rx="8" className="fill-ink" />
            <rect x="320" y="170" width="28" height="20" rx="3" className="fill-sun" />
          </g>
          <g className="hover:-translate-y-1.5">
            <rect x="376" y="130" width="40" height="130" rx="8" className="fill-brick" />
            <circle cx="396" cy="165" r="10" className="fill-card opacity-90" />
          </g>
        </g>
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PREDIOS.map((predio) => (
          <Link
            key={predio.label}
            to={predio.to}
            className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:bg-sun hover:text-sun-foreground"
          >
            {predio.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Onda decorativa entre seções. */
export function Onda({ variante = "para-fundo" }: { variante?: "para-fundo" | "para-papel" }) {
  const cor = variante === "para-fundo" ? "fill-secondary" : "fill-background";
  return (
    <div className="-mt-px h-12 md:h-16">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="block h-full w-full">
        <path
          d={
            variante === "para-fundo"
              ? "M0,32 C240,60 480,4 720,26 C960,48 1200,10 1440,30 L1440,60 L0,60 Z"
              : "M0,30 C240,10 480,50 720,28 C960,6 1200,44 1440,26 L1440,60 L0,60 Z"
          }
          className={cor}
        />
      </svg>
    </div>
  );
}
