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
import { usePremium } from "@/hooks/usePremium";
import { enviarImagem } from "@/lib/imagens";
import {
  atualizarRegistro,
  inserirRegistro,
  useInvalidar,
  type Registro,
  type Tabela,
} from "@/lib/dados";

export type Campo = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "switch" | "image" | "horarios";
  options?: string[];
  optionLabels?: Record<string, string>;
  placeholder?: string;
  required?: boolean;
  max?: number;
  allowCustom?: boolean;
};

function valoresIniciais(campos: Campo[], registro?: Registro) {
  const iniciais: Record<string, string | boolean> = {};
  if (!registro) return iniciais;
  for (const campo of campos) {
    const valor = registro[campo.name];
    if (campo.type === "switch") iniciais[campo.name] = Boolean(valor);
    else if (campo.type !== "image") iniciais[campo.name] = valor == null ? "" : String(valor);
  }
  return iniciais;
}

function FormularioRegistro({
  tabela,
  titulo,
  descricao,
  campos,
  registro,
  rotuloSalvar,
  extra,
  mensagemSucesso,
  onPronto,
}: {
  tabela: Tabela;
  titulo: string;
  descricao: string;
  campos: Campo[];
  registro?: Registro;
  rotuloSalvar: string;
  extra?: Record<string, unknown> | undefined;
  mensagemSucesso?: string | undefined;
  onPronto: () => void;
}) {
  const { user } = useAuth();
  const { podePublicarNovidades: podeGaleria } = usePremium();
  const invalidar = useInvalidar(tabela);
  const [salvando, setSalvando] = useState(false);
  const [valores, setValores] = useState<Record<string, string | boolean>>(() =>
    valoresIniciais(campos, registro),
  );
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [fotosExtras, setFotosExtras] = useState<File[]>([]);
  const [fotosAtuais, setFotosAtuais] = useState<string[]>(
    Array.isArray(registro?.["fotos_extras"]) ? registro["fotos_extras"].filter((foto): foto is string => typeof foto === "string") : [],
  );

  const definir = (name: string, value: string | boolean) =>
    setValores((atual) => ({ ...atual, [name]: value }));

  async function salvar() {
    try {
      const payload: Record<string, unknown> = {};
      for (const campo of campos) {
        if (campo.type === "image") continue;
        const bruto = valores[campo.name];
        if (campo.type === "switch") {
          payload[campo.name] = Boolean(bruto);
          continue;
        }
        const texto = String(bruto ?? "").trim();
        const schema = campo.required
          ? z
              .string()
              .trim()
              .min(2, `Preencha o campo ${campo.label}.`)
              .max(campo.max ?? 4000)
          : z
              .string()
              .trim()
              .max(campo.max ?? 4000);
        const resultado = schema.safeParse(texto);
        if (!resultado.success) {
          toast.error(resultado.error.issues[0]?.message ?? `Verifique o campo ${campo.label}.`);
          return;
        }
        payload[campo.name] = texto === "" ? null : texto;
      }

      setSalvando(true);
      if (!user) {
        toast.error("Entre na sua conta para publicar.");
        return;
      }

      const campoImagem = campos.find((c) => c.type === "image");
      if (campoImagem && arquivo) {
        payload[campoImagem.name] = await enviarImagem(arquivo, user.id);
      }
      if (tabela === "comercios" && podeGaleria && (fotosExtras.length > 0 || fotosAtuais.length !== (Array.isArray(registro?.["fotos_extras"]) ? registro["fotos_extras"].length : 0))) {
        if (fotosExtras.length + fotosAtuais.length > 5) throw new Error("Escolha até cinco fotos extras.");
        payload["fotos_extras"] = [...fotosAtuais, ...await Promise.all(fotosExtras.map((foto) => enviarImagem(foto, user.id)))];
      }

      if (registro) {
        await atualizarRegistro(tabela, registro.id, payload);
      } else {
        Object.assign(payload, extra ?? {});
        payload["user_id"] = user.id;
        await inserirRegistro(tabela, payload);
      }
      await invalidar();
      toast.success(
        registro
          ? "Alterações salvas."
          : (mensagemSucesso ?? "Enviado! Sua publicação aparecerá após a aprovação da administração."),
      );
      setArquivo(null);
      setFotosExtras([]);
      if (!registro) setValores({});
      onPronto();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar agora.");
    } finally {
      setSalvando(false);
    }
  }

  return (
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
            temImagem={Boolean(registro && registro[campo.name])}
          />
        ))}
        {tabela === "comercios" && podeGaleria && (
          <div className="grid gap-2">
            <Label htmlFor="fotos-extras">Fotos extras (Premium, até 5)</Label>
            {fotosAtuais.map((foto, indice) => (
              <div key={foto} className="flex items-center justify-between gap-2 text-sm">
                <span>Foto {indice + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFotosAtuais((atual) => atual.filter((item) => item !== foto))}>Remover</Button>
              </div>
            ))}
            <Input id="fotos-extras" type="file" accept="image/*" multiple onChange={(e) => setFotosExtras(Array.from(e.target.files ?? []))} />
            {fotosExtras.length > 0 && <p className="text-xs text-muted-foreground">{fotosExtras.length} foto(s) selecionada(s)</p>}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={salvar} disabled={salvando}>
          {salvando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {rotuloSalvar}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function PublicarDialog({
  tabela,
  titulo,
  descricao,
  campos,
  rotulo = "Publicar",
  extra,
  gatilho,
  mensagemSucesso,
}: {
  tabela: Tabela;
  titulo: string;
  descricao: string;
  campos: Campo[];
  rotulo?: string;
  extra?: Record<string, unknown>;
  gatilho?: ReactNode;
  mensagemSucesso?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Button asChild variant="secondary">
        <Link to="/entrar">Entre para {rotulo.toLowerCase()}</Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {gatilho ?? (
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> {rotulo}
          </Button>
        )}
      </DialogTrigger>
      {open && (
        <FormularioRegistro
          tabela={tabela}
          titulo={titulo}
          descricao={descricao}
          campos={campos}
          extra={extra}
          mensagemSucesso={mensagemSucesso}
           rotuloSalvar="Enviar para aprovação"
          onPronto={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
}

export function EditarDialog({
  tabela,
  campos,
  registro,
  gatilho,
}: {
  tabela: Tabela;
  campos: Campo[];
  registro: Registro;
  gatilho: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{gatilho}</DialogTrigger>
      {open && (
        <FormularioRegistro
          tabela={tabela}
          titulo="Editar publicação"
           descricao="Ao salvar, as alterações precisarão de nova aprovação antes de aparecer no site."
          campos={campos}
          registro={registro}
          rotuloSalvar="Salvar alterações"
          onPronto={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
}

const OPCAO_CUSTOM = "__personalizar__";

function CampoForm({
  campo,
  valor,
  onChange,
  onFile,
  arquivo,
  temImagem,
}: {
  campo: Campo;
  valor: string | boolean | undefined;
  onChange: (name: string, value: string | boolean) => void;
  onFile: (file: File | null) => void;
  arquivo: File | null;
  temImagem?: boolean;
}) {
  const id = `campo-${campo.name}`;
  const opcoesPredefinidas = new Set(campo.options ?? []);
  const [modoCustom, setModoCustom] = useState(
    Boolean(campo.allowCustom && valor && !opcoesPredefinidas.has(String(valor))),
  );
  const isCustom = Boolean(campo.allowCustom) && modoCustom;

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
        <Switch id={id} checked={Boolean(valor)} onCheckedChange={(v) => onChange(campo.name, v)} />
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
          maxLength={campo.max ?? 4000}
          placeholder={campo.placeholder}
          value={String(valor ?? "")}
          onChange={(e) => onChange(campo.name, e.target.value)}
        />
      ) : campo.type === "select" ? (
        <div className="grid gap-2">
          <select
            id={id}
            value={isCustom ? OPCAO_CUSTOM : String(valor ?? "")}
            onChange={(e) => {
              const v = e.target.value;
              setModoCustom(v === OPCAO_CUSTOM);
              onChange(campo.name, v === OPCAO_CUSTOM ? "" : v);
            }}

            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Selecione…</option>
            {campo.options?.map((opcao) => (
              <option key={opcao} value={opcao}>
                {campo.optionLabels?.[opcao] ?? opcao}
              </option>
            ))}
            {campo.allowCustom && <option value={OPCAO_CUSTOM}>Personalizar…</option>}
          </select>
          {isCustom && (
            <Input
              placeholder={`Digite ${campo.label.toLowerCase()}`}
              value={String(valor ?? "")}
              onChange={(e) => onChange(campo.name, e.target.value)}
              required={campo.required}
            />
          )}
        </div>
      ) : campo.type === "image" ? (
        <div className="grid gap-1.5">
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {arquivo
              ? `Imagem selecionada: ${arquivo.name}`
              : temImagem
                ? "Já existe uma imagem. Escolha outra para substituir."
                : "Opcional • até 6 MB"}
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
