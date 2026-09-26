import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteImage } from "@/components/site/SiteImage";

export function GaleriaComercio({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [indice, setIndice] = useState(0);
  if (fotos.length === 0) return null;
  const atual = Math.min(indice, fotos.length - 1);
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden">
      <SiteImage path={fotos[atual]} alt={`${titulo}, foto ${atual + 1} de ${fotos.length}`} className="h-full w-full" />
      {fotos.length > 1 && (
        <>
          <Button type="button" variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2" aria-label="Foto anterior" title="Foto anterior" onClick={() => setIndice((atual + fotos.length - 1) % fotos.length)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Próxima foto" title="Próxima foto" onClick={() => setIndice((atual + 1) % fotos.length)}><ChevronRight className="h-4 w-4" /></Button>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-background/90 px-2 py-0.5 text-xs text-foreground">{atual + 1} / {fotos.length}</span>
        </>
      )}
    </div>
  );
}