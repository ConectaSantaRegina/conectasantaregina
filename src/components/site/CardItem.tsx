import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SiteImage } from "@/components/site/SiteImage";
import { EditarDialog } from "@/components/site/PublicarDialog";
import { CAMPOS } from "@/lib/campos";
import { useAuth } from "@/hooks/useAuth";
import { apagarRegistro, useInvalidar, type Registro, type Tabela } from "@/lib/dados";

export function CardItem({
  titulo,
  badge,
  imagem,
  descricao,
  infos,
  rodape,
  registro,
  tabela,
}: {
  titulo: string;
  badge?: string | null;
  imagem?: string | null;
  descricao?: string | null;
  infos?: { icone: ReactNode; texto: string }[];
  rodape?: ReactNode;
  registro: Registro;
  tabela: Tabela;
}) {
  return (
    <article className="surface-card flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      {imagem && <SiteImage path={imagem} alt={titulo} className="aspect-[16/10] w-full" />}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <h3 className="min-w-0 font-display text-lg font-bold leading-snug">{titulo}</h3>
          {badge && (
            <Badge variant="secondary" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        {descricao && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {descricao}
          </p>
        )}
        {infos && infos.length > 0 && (
          <ul className="grid gap-1.5 text-sm text-muted-foreground">
            {infos.map((info, i) => (
              <li key={i} className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 shrink-0 text-primary">{info.icone}</span>
                <span className="min-w-0 whitespace-pre-line break-words">{info.texto}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {rodape}
          <AcoesRegistro registro={registro} tabela={tabela} />
        </div>
      </div>
    </article>
  );
}

/** Botões Editar e Apagar, visíveis para o autor da publicação ou para admins. */
export function AcoesRegistro({ registro, tabela }: { registro: Registro; tabela: Tabela }) {
  const { user, isAdmin } = useAuth();
  const invalidar = useInvalidar(tabela);
  const podeGerenciar = Boolean(user && (isAdmin || user.id === registro.user_id));
  const campos = CAMPOS[tabela];

  if (!podeGerenciar) return null;

  async function apagar() {
    try {
      await apagarRegistro(tabela, registro.id);
      await invalidar();
      toast.success("Publicação removida.");
    } catch {
      toast.error("Não foi possível remover agora.");
    }
  }

  return (
    <div className="ml-auto flex items-center gap-1">
      {campos && (
        <EditarDialog
          tabela={tabela}
          campos={campos}
          registro={registro}
          gatilho={
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Pencil className="mr-1.5 h-4 w-4" /> Editar
            </Button>
          }
        />
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Apagar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar esta publicação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A publicação sairá do site para todos os moradores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={apagar}>Apagar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Mantido para compatibilidade: apenas o botão de apagar (com confirmação). */
export function BotaoApagar({ registro, tabela }: { registro: Registro; tabela: Tabela }) {
  return <AcoesRegistro registro={registro} tabela={tabela} />;
}
