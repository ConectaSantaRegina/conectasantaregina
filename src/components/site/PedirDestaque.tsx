import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatarData, txt, type Registro } from "@/lib/dados";

const esquema = z.object({
  negocio: z.string().trim().min(2, "Informe o nome do seu negócio.").max(160),
  contato: z.string().trim().min(6, "Informe um telefone, WhatsApp ou e-mail.").max(200),
  mensagem: z.string().trim().max(2000),
});

/** Botão "Quero aparecer no feed": registra o interesse do comerciante em acesso Premium. */
export function PedirDestaque({ variante = "default" }: { variante?: "default" | "secondary" }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [negocio, setNegocio] = useState("");
  const [contato, setContato] = useState("");
  const [mensagem, setMensagem] = useState("");
  const pedidos = useQuery({
    queryKey: ["meus-pedidos-premium", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("pedidos_destaque").select("id,status").eq("user_id", user?.id ?? "").in("status", ["novo", "em contato"]).limit(1);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!user) {
    return (
      <Button asChild variant="secondary">
        <Link to="/entrar">Entre para aparecer no feed</Link>
      </Button>
    );
  }

  async function enviar() {
    if (!user) {
      toast.error("Entre na sua conta para enviar o pedido.");
      return;
    }
    const resultado = esquema.safeParse({ negocio, contato, mensagem });
    if (!resultado.success) {
      toast.error(resultado.error.issues[0]?.message ?? "Verifique os dados.");
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.from("pedidos_destaque").insert({
         user_id: user.id,
        negocio: resultado.data.negocio,
        contato: resultado.data.contato,
        mensagem: resultado.data.mensagem || null,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["pedidos-destaque"] });
       await queryClient.invalidateQueries({ queryKey: ["meus-pedidos-premium"] });
      toast.success("Pedido enviado! Vamos entrar em contato para combinar os detalhes.");
      setNegocio("");
      setContato("");
      setMensagem("");
      setOpen(false);
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (pedidos.data?.length) return <Badge variant="secondary">Pedido Premium em análise</Badge>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variante}>
          <Megaphone className="mr-1.5 h-4 w-4" /> Quero aparecer no feed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quero aparecer no feed</DialogTitle>
          <DialogDescription>
             Preencha seus dados para solicitar acesso Premium e aparecer no feed da página inicial.
             A administração entra em contato para combinar os detalhes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="destaque-negocio">
              Nome do negócio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destaque-negocio"
              value={negocio}
              maxLength={160}
              onChange={(e) => setNegocio(e.target.value)}
              placeholder="Ex.: Stylofarma Santa Regina"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="destaque-contato">
              Contato (WhatsApp, telefone ou e-mail) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destaque-contato"
              value={contato}
              maxLength={200}
              onChange={(e) => setContato(e.target.value)}
              placeholder="(47) 90000-0000"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="destaque-mensagem">O que você quer divulgar?</Label>
            <Textarea
              id="destaque-mensagem"
              rows={4}
              maxLength={2000}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Promoção, período desejado, observações…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={enviar} disabled={enviando}>
            {enviando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Enviar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Lista dos pedidos de destaque: o comerciante vê os seus, o admin vê todos. */
export function ListaPedidosDestaque() {
  const { user, isAdmin } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["pedidos-destaque", user?.id, isAdmin],
    enabled: Boolean(user),
    queryFn: async (): Promise<Registro[]> => {
      const { data, error } = await supabase
        .from("pedidos_destaque")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Registro[];
    },
  });

  if (!user || isLoading || !data || data.length === 0) return null;

  return (
    <section className="grid gap-4">
      <h2 className="font-display text-xl font-bold">
        {isAdmin ? "Pedidos de destaque no feed" : "Meus pedidos de destaque"}{" "}
        <span className="text-sm font-medium text-muted-foreground">({data.length})</span>
      </h2>
      <ul className="grid gap-3">
        {data.map((pedido) => (
          <li key={pedido.id} className="surface-card grid gap-1.5 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{txt(pedido, "negocio")}</p>
              <Badge variant="secondary">{txt(pedido, "status")}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatarData(pedido.created_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{txt(pedido, "contato")}</p>
            {txt(pedido, "mensagem") && (
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {txt(pedido, "mensagem")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
