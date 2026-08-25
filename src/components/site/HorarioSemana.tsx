import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

type Dia = { abre: string; fecha: string; fechado: boolean };

const vazio = (): Record<string, Dia> =>
  Object.fromEntries(DIAS.map((d) => [d, { abre: "", fecha: "", fechado: false }]));

function compor(dias: Record<string, Dia>) {
  const linhas = DIAS.map((d) => {
    const dia = dias[d]!;
    if (dia.fechado) return `${d}: Fechado`;
    if (!dia.abre && !dia.fecha) return null;
    return `${d}: ${dia.abre || "?"}–${dia.fecha || "?"}`;
  }).filter(Boolean) as string[];
  return linhas.join("\n");
}

export function HorarioSemana({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: string;
  onChange: (texto: string) => void;
}) {
  const [dias, setDias] = useState<Record<string, Dia>>(vazio);

  useEffect(() => {
    if (valor === "") setDias(vazio());
  }, [valor]);

  const atualizar = (dia: string, patch: Partial<Dia>) => {
    setDias((atual) => {
      const proximo = { ...atual, [dia]: { ...atual[dia]!, ...patch } };
      onChange(compor(proximo));
      return proximo;
    });
  };

  const copiarParaTodos = () => {
    const base = dias["Seg"]!;
    setDias(() => {
      const proximo = Object.fromEntries(DIAS.map((d) => [d, { ...base }]));
      onChange(compor(proximo));
      return proximo;
    });
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={copiarParaTodos}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Repetir segunda em todos
        </button>
      </div>
      <div className="grid gap-2 rounded-xl border border-border p-3">
        {DIAS.map((d) => {
          const dia = dias[d]!;
          return (
            <div key={d} className="grid grid-cols-[2.5rem_1fr_1fr_auto] items-center gap-2">
              <span className="text-sm font-semibold">{d}</span>
              <Input
                type="time"
                aria-label={`Abre ${d}`}
                disabled={dia.fechado}
                value={dia.abre}
                onChange={(e) => atualizar(d, { abre: e.target.value })}
              />
              <Input
                type="time"
                aria-label={`Fecha ${d}`}
                disabled={dia.fechado}
                value={dia.fecha}
                onChange={(e) => atualizar(d, { fecha: e.target.value })}
              />
              <div className="flex items-center gap-1.5">
                <Switch
                  aria-label={`Fechado ${d}`}
                  checked={dia.fechado}
                  onCheckedChange={(v) => atualizar(d, { fechado: v })}
                />
                <span className="text-xs text-muted-foreground">Fechado</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Deixe em branco os dias que não quiser informar.
      </p>
    </div>
  );
}
