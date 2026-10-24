import { Eye } from "lucide-react";
import { useVisitasSite } from "@/hooks/useVisitas";
import { formatarVisitas } from "@/lib/visitas";

export function ContadorVisualizacoes({ total }: { total: number }) {
  const texto = `${formatarVisitas(total)} ${total === 1 ? "visualização" : "visualizações"}`;
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground tabular-nums" aria-label={texto}>
      <Eye className="size-5" aria-hidden /> {texto}
    </span>
  );
}

export function BadgeVisitas({ className = "" }: { className?: string }) {
  const total = useVisitasSite();
  if (total === null) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-sm md:text-sm ${className}`}>
      <Eye className="size-4" aria-hidden /> {formatarVisitas(total)} visitas ao bairro
    </span>
  );
}
