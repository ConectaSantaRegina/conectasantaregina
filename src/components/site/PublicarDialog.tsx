import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HorarioSemana } from "@/components/site/HorarioSemana";
import { useAuth } from "@/hooks/useAuth";
import { enviarImagem } from "@/lib/imagens";
import { inserirRegistro, useInvalidar, type Tabela } from "@/lib/dados";

export type Campo = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "switch" | "image" | "horarios";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  max?: number;
};

export function PublicarDialog({
  tabela,
  titulo,
  descricao,
  campos,
  rotulo = "Publicar",
}: {
  tabela: Tabela;
  titulo: string;
  descricao: string;
  campos: Campo[];
  rotulo?: string;
}) {
  const { user } = useAuth();
  const invalidar = useInvalidar(tabela);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [valores, setValores] = useState<Record<string, string | boolean>>({});
  const [arquivo, setArquivo] = useState<File | null>(null);

  if (!user) {
    return (
      <Button asChild variant="secondary">
        <Link to="/entrar">Entre para {rotulo.toLowerCase()}</Link>
      </Button>
    );
  }

  const definir = (name: string, value: string | boolean) =>
    setValores((atual) => ({ ...atual, [name]: value }));

  async function salvar() {
    try {
      const payload: Record<string, unknown> = { user_id: user!.id };
      for (const campo of campos) {
        if (campo.type === "image") continue;
        const bruto = valores[campo.name];
        if (campo.type === "switch") {
          payload[campo.name] = Boolean(bruto);
          continue;
        }
        const texto = String(bruto ?? "").trim();
        const schema = campo.required
          ? z.string().trim().min(2, `Preencha o campo ${campo.label}.`).max(campo.max ?? 2000)
          : z.string().trim().max(campo.max ?? 2000);
        const resultado = schema.safeParse(texto);
        if (!resultado.success) {
          toast.error(resultado.error.issues[0]?.message ?? `Verifique o campo ${campo.label}.`);
          return;
        }
        payload[campo.name] = texto === "" ? null : texto;
      }

      setSalvando(true);
      const campoImagem = campos.find((c) => c.type === "image");
      if (campoImagem && arquivo) {
        payload[campoImagem.name] = await enviarImagem(arquivo, user!.id);
      }
      await inserirRegistro(tabela, payload);
      await invalidar();
      toast.success("Publicado! Obrigada por contribuir com o bairro.");
      setValores({});
      setArquivo(null);
      setOpen(false);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível publicar agora.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> {rotulo}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {campos.map((campo) => (
            <CampoForm
              key={campo.name}
              campo={campo}
              valor={valores[campo.name]}
              onChange={definir}
              onFile={setArquivo}
              arquivo={arquivo}
            />
          ))}
        </div>
        <DialogFooter>
          <Button onClick={salvar} disabled={salvando}>
            {salvando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Publicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampoForm({
  campo,
  valor,
  onChange,
  onFile,
  arquivo,
}: {
  campo: Campo;
  valor: string | boolean | undefined;
  onChange: (name: string, value: string | boolean) => void;
  onFile: (file: File | null) => void;
  arquivo: File | null;
}) {
  const id = `campo-${campo.name}`;

  if (campo.type === "horarios") {
    return (
      <HorarioSemana
        label={campo.label}
        valor={String(valor ?? "")}
        onChange={(texto) => onChange(campo.name, texto)}
      />
    );
  }


  if (campo.type === "switch") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
        <Label htmlFor={id}>{campo.label}</Label>
        <Switch
          id={id}
          checked={Boolean(valor)}
          onCheckedChange={(v) => onChange(campo.name, v)}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>
        {campo.label}
        {campo.required && <span className="text-destructive"> *</span>}
      </Label>
      {campo.type === "textarea" ? (
        <Textarea
          id={id}
          rows={4}
          maxLength={campo.max ?? 2000}
          placeholder={campo.placeholder}
          value={String(valor ?? "")}
          onChange={(e) => onChange(campo.name, e.target.value)}
        />
      ) : campo.type === "select" ? (
        <select
          id={id}
          value={String(valor ?? "")}
          onChange={(e) => onChange(campo.name, e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Selecione…</option>
          {campo.options?.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      ) : campo.type === "image" ? (
        <div className="grid gap-1.5">
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {arquivo ? `Imagem selecionada: ${arquivo.name}` : "Opcional • até 6 MB"}
          </p>
        </div>
      ) : (
        <Input
          id={id}
          maxLength={campo.max ?? 200}
          placeholder={campo.placeholder}
          value={String(valor ?? "")}
          onChange={(e) => onChange(campo.name, e.target.value)}
        />
      )}
    </div>
  );
}
