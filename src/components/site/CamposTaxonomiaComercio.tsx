import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { classificarComercios, useTaxonomiaComercio } from "@/lib/taxonomia-comercio";
import type { Registro } from "@/lib/dados";

export function CamposTaxonomiaComercio({ registro, onChange }: {
  registro?: Registro | undefined;
  onChange: (categoria: string, subcategorias: string[], personalizadas: string[]) => void;
}) {
  const taxonomia = useTaxonomiaComercio();
  const [categoria, setCategoria] = useState("");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [personalizar, setPersonalizar] = useState(false);
  const [texto, setTexto] = useState("");
  const linhas = (valor: string) => valor.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const [inicializado, setInicializado] = useState(false);
  useEffect(() => {
    if (inicializado || !taxonomia.data) return;
    const item = registro ? classificarComercios([registro], taxonomia.data.categorias, taxonomia.data.vinculos)[0] : undefined;
    const principal = item?.categoria?.id ?? "";
    const subs = item?.subcategorias.map((sub) => sub.id) ?? [];
    setCategoria(principal);
    setSelecionadas(subs);
    const manuais = Array.isArray(registro?.["subcategorias_personalizadas"]) ? registro["subcategorias_personalizadas"].filter((item): item is string => typeof item === "string") : [];
    setTexto(manuais.join("\n"));
    setPersonalizar(manuais.length > 0);
    onChange(principal, subs, manuais);
    setInicializado(true);
  }, [taxonomia.data, registro, inicializado, onChange]);
  const categorias = taxonomia.data?.categorias ?? [];
  const subcategorias = categorias.filter((item) => item.categoria_pai_id === categoria);
  return <div className="grid gap-4">
    <div className="grid gap-1.5">
      <Label htmlFor="categoria-principal">Categoria principal <span className="text-destructive">*</span></Label>
      <select id="categoria-principal" className="min-h-11 rounded-md border border-input bg-background px-3 text-sm" value={categoria} disabled={taxonomia.isLoading || taxonomia.isError} onChange={(event) => {
        setCategoria(event.target.value); setSelecionadas([]); setTexto(""); setPersonalizar(false); onChange(event.target.value, [], []);
      }}>
        <option value="">Selecione…</option>
        {categorias.filter((item) => !item.categoria_pai_id).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
      </select>
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="subcategoria">Subcategorias <span className="text-destructive">*</span></Label>
      <select id="subcategoria" className="min-h-11 rounded-md border border-input bg-background px-3 text-sm" value={personalizar ? "__personalizar__" : ""} disabled={!categoria || taxonomia.isLoading || taxonomia.isError} onChange={(event) => {
        if (event.target.value === "__personalizar__") { setPersonalizar(true); return; }
        if (!event.target.value) return;
        const proximas = [...selecionadas, event.target.value];
        setSelecionadas(proximas); onChange(categoria, proximas, linhas(texto));
      }}>
        <option value="">{categoria ? "Selecione…" : "Selecione a categoria principal…"}</option>
        {subcategorias.filter((item) => !selecionadas.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
        <option value="__personalizar__">Personalizar…</option>
      </select>
      {selecionadas.length > 0 && <ul className="grid gap-1">
        {selecionadas.map((id) => <li key={id} className="flex min-h-11 items-center justify-between gap-2 text-sm">
          <span>{subcategorias.find((item) => item.id === id)?.nome}</span>
          <Button type="button" variant="ghost" size="icon" aria-label={`Remover ${subcategorias.find((item) => item.id === id)?.nome}`} onClick={() => {
            const proximas = selecionadas.filter((item) => item !== id); setSelecionadas(proximas); onChange(categoria, proximas, linhas(texto));
          }}><X className="h-4 w-4" /></Button>
        </li>)}
      </ul>}
      {personalizar && <div className="grid gap-1.5">
        <Label htmlFor="subcategorias-personalizadas">Subcategorias personalizadas</Label>
        <Textarea id="subcategorias-personalizadas" rows={4} maxLength={2020} placeholder="Uma subcategoria por linha" value={texto} onChange={(event) => { setTexto(event.target.value); onChange(categoria, selecionadas, linhas(event.target.value)); }} />
        <p className="text-xs text-muted-foreground">As subcategorias personalizadas serão enviadas para aprovação junto com o cadastro.</p>
      </div>}
    </div>
    {taxonomia.isError && <p role="alert" className="text-sm text-destructive">Não foi possível carregar as categorias. Tente novamente.</p>}
  </div>;
}