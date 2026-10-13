import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { classificarComercios, useTaxonomiaComercio } from "@/lib/taxonomia-comercio";
import type { Registro } from "@/lib/dados";

export function CamposTaxonomiaComercio({ registro, onChange }: {
  registro?: Registro | undefined;
  onChange: (categoria: string, subcategorias: string[]) => void;
}) {
  const taxonomia = useTaxonomiaComercio();
  const [categoria, setCategoria] = useState("");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [inicializado, setInicializado] = useState(false);
  useEffect(() => {
    if (inicializado || !taxonomia.data) return;
    const item = registro ? classificarComercios([registro], taxonomia.data.categorias, taxonomia.data.vinculos)[0] : undefined;
    const principal = item?.categoria?.id ?? "";
    const subs = item?.subcategorias.map((sub) => sub.id) ?? [];
    setCategoria(principal);
    setSelecionadas(subs);
    onChange(principal, subs);
    setInicializado(true);
  }, [taxonomia.data, registro, inicializado, onChange]);
  const categorias = taxonomia.data?.categorias ?? [];
  const subcategorias = categorias.filter((item) => item.categoria_pai_id === categoria);
  return <div className="grid gap-4">
    <div className="grid gap-1.5">
      <Label htmlFor="categoria-principal">Categoria principal <span className="text-destructive">*</span></Label>
      <select id="categoria-principal" className="min-h-11 rounded-md border border-input bg-background px-3 text-sm" value={categoria} disabled={taxonomia.isLoading || taxonomia.isError} onChange={(event) => {
        setCategoria(event.target.value); setSelecionadas([]); onChange(event.target.value, []);
      }}>
        <option value="">Selecione…</option>
        {categorias.filter((item) => !item.categoria_pai_id).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
      </select>
    </div>
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">Subcategorias <span className="text-destructive">*</span></legend>
      {!categoria && <p className="text-sm text-muted-foreground">Selecione a categoria principal.</p>}
      <div className="grid sm:grid-cols-2">
        {subcategorias.map((item) => <Label key={item.id} className="flex min-h-11 cursor-pointer items-center gap-2" htmlFor={`sub-${item.id}`}>
          <Checkbox id={`sub-${item.id}`} checked={selecionadas.includes(item.id)} onCheckedChange={(checked) => {
            const proximas = checked === true ? [...selecionadas, item.id] : selecionadas.filter((id) => id !== item.id);
            setSelecionadas(proximas); onChange(categoria, proximas);
          }} />{item.nome}
        </Label>)}
      </div>
    </fieldset>
    {taxonomia.isError && <p role="alert" className="text-sm text-destructive">Não foi possível carregar as categorias. Tente novamente.</p>}
  </div>;
}