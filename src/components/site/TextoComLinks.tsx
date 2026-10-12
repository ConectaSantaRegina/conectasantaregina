/** Converte links no meio de textos em <a> clicáveis: https://, www., *.com.br, *.com, *.org */
const REGEX =
  /(?:https?:\/\/|www\.)[^\s<>"']+|(?<!@)(?:[\w-]+\.)+(?:com\.br|com|org)(?:\/[^\s<>"']*)?/gi;

type Parte = { tipo: "texto" | "link"; valor: string };

function fatiar(texto: string): Parte[] {
  const partes: Parte[] = [];
  let last = 0;
  for (const m of texto.matchAll(REGEX)) {
    const idx = m.index ?? 0;
    if (idx > last) partes.push({ tipo: "texto", valor: texto.slice(last, idx) });
    const bruto = m[0];
    const link = bruto.replace(/[.,;:!?)\]]+$/, "");
    if (link) {
      partes.push({ tipo: "link", valor: link });
      if (bruto.length > link.length) {
        partes.push({ tipo: "texto", valor: bruto.slice(link.length) });
      }
    } else {
      partes.push({ tipo: "texto", valor: bruto });
    }
    last = idx + bruto.length;
  }
  if (last < texto.length) partes.push({ tipo: "texto", valor: texto.slice(last) });
  return partes;
}

function hrefDe(link: string) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

export function TextoComLinks({
  texto,
  className,
}: {
  texto: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {fatiar(texto).map((p, i) =>
        p.tipo === "texto" ? (
          <span key={i}>{p.valor}</span>
        ) : (
          <a
            key={i}
            href={hrefDe(p.valor)}
            target="_blank"
            rel="noreferrer"
            className="break-all font-semibold text-primary underline hover:text-primary/80"
          >
            {p.valor}
          </a>
        ),
      )}
    </span>
  );
}
