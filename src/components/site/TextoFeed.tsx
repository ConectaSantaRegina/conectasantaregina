import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextoComLinks } from "@/components/site/TextoComLinks";

const LIMITE_TEXTO = 350;

export function TextoFeed({ texto }: { texto: string }) {
  const [expandido, setExpandido] = useState(false);
  const id = useId();
  const primeirasLinhas = texto.split("\n").slice(0, 6).join("\n");
  const trecho = primeirasLinhas.slice(0, LIMITE_TEXTO);
  const longo = trecho.length < texto.length;
  const ultimoEspaco = trecho.search(/\s+\S*$/);
  const resumo = longo && ultimoEspaco > 0 ? trecho.slice(0, ultimoEspaco) : trecho;

  return (
    <div className="mt-2 min-w-0">
      <div id={id}>
        <TextoComLinks
          className="block whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground sm:text-base"
          texto={longo && !expandido ? `${resumo.trimEnd()}…` : texto}
        />
      </div>
      {longo && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-1 h-auto px-0 py-1"
          aria-expanded={expandido}
          aria-controls={id}
          onClick={() => setExpandido((atual) => !atual)}
        >
          {expandido ? "Ver menos" : "Ver mais"}
        </Button>
      )}
    </div>
  );
}