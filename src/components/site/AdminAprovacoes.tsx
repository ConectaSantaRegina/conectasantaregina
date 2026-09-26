import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Crown, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteImage } from "@/components/site/SiteImage";
import { EstadoVazio } from "@/components/site/PageHero";
import { formatarData, TABELAS_MODERADAS } from "@/lib/dados";

function dataEmDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

type Perfil = {
  id: string;
  nome: string;
  morador: boolean | null;
  created_at: string;
};

type PremiumUsuario = {
  id: string;
  user_id: string;
  valido_ate: string;
  ativo: boolean;
  observacao: string | null;
  created_at: string;
};

/** Aprovação de cadastros de moradores: marcar (ou não) como Premium. */
export function AdminUsuariosPremium({ selecionado }: { selecionado?: string }) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const pessoaSelecionada = selecionado || userId;
  const [validoAte, setValidoAte] = useState(dataEmDias(30));
  const [observacao, setObservacao] = useState("");

  const perfis = useQuery({
    queryKey: ["admin-perfis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,nome,morador,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Perfil[];
    },
  });

  const premiumUsuarios = useQuery({
    queryKey: ["admin-premium-usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("premium")
        .select("id,user_id,comercio_id,valido_ate,ativo,observacao,created_at")
        .is("comercio_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PremiumUsuario[];
    },
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-premium-usuarios"] });
    queryClient.invalidateQueries({ queryKey: ["meu-premium"] });
    queryClient.invalidateQueries({ queryKey: ["premium-ativos"] });
    queryClient.invalidateQueries({ queryKey: ["galerias-premium"] });
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Escolha a pessoa na lista.");
      if (!validoAte) throw new Error("Informe até quando o Premium vale.");
       const existente = (premiumUsuarios.data ?? []).find((p) => p.user_id === pessoaSelecionada);
       const dados = { valido_ate: validoAte, ativo: true, observacao: observacao.trim() || null };
       const { error } = existente
         ? await supabase.from("premium").update(dados).eq("id", existente.id)
         : await supabase.from("premium").insert({ ...dados, user_id: pessoaSelecionada, comercio_id: null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pessoa liberada como Premium.");
      setObservacao("");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar."),
  });

  const alterar = useMutation({
    mutationFn: async (p: { id: string; valido_ate?: string; ativo?: boolean }) => {
      const { id, ...campos } = p;
      const { error } = await supabase.from("premium").update(campos).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: (e: Error) => toast.error(e.message || "Não foi possível atualizar."),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("premium").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Premium retirado. A conta continua funcionando normalmente.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível remover."),
  });

  const nomeDe = (id: string) =>
    (perfis.data ?? []).find((p) => p.id === id)?.nome || "Pessoa sem nome";

  const hoje = new Date().toISOString().slice(0, 10);
  const lista = premiumUsuarios.data ?? [];

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form
        className="surface-card grid h-fit gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          salvar.mutate();
        }}
      >
        <h2 className="font-display text-lg font-bold">
          <Crown className="mr-1.5 inline h-4 w-4 text-primary" /> Liberar pessoa como Premium
        </h2>
        <p className="text-xs text-muted-foreground">
          Só quem está Premium e dentro da validade pode publicar no Feed. Toda publicação ainda
          passa pela sua aprovação.
        </p>

        <div className="grid gap-2">
          <Label>Pessoa cadastrada</Label>
           <Select value={pessoaSelecionada} onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha quem se cadastrou" />
            </SelectTrigger>
            <SelectContent>
              {(perfis.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome || "Sem nome"}
                  {p.morador === true ? " — moradora(o)" : p.morador === false ? " — de fora" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="premium_user_data">Válido até</Label>
          <Input
            id="premium_user_data"
            type="date"
            value={validoAte}
            onChange={(e) => setValidoAte(e.target.value)}
            required
          />
          <div className="flex flex-wrap gap-2">
            {[
              { d: 30, r: "30 dias" },
              { d: 90, r: "3 meses" },
              { d: 365, r: "1 ano" },
            ].map((op) => (
              <Button
                key={op.d}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setValidoAte(dataEmDias(op.d))}
              >
                {op.r}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="premium_user_obs">Observação (opcional)</Label>
          <Textarea
            id="premium_user_obs"
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex.: pago por PIX em 07/09, R$ 50"
          />
        </div>

         <Button type="submit" disabled={salvar.isPending || !pessoaSelecionada}>
          {salvar.isPending ? "Salvando…" : "Liberar Premium"}
        </Button>
      </form>

      <section className="grid gap-4">
        <h2 className="font-display text-lg font-bold">
          Pessoas com Premium{" "}
          <span className="text-sm font-medium text-muted-foreground">({lista.length})</span>
        </h2>
        {premiumUsuarios.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : lista.length === 0 ? (
          <EstadoVazio texto="Nenhuma pessoa liberada como Premium ainda." />
        ) : (
          <ul className="grid gap-3">
            {lista.map((row) => {
              const valido = row.ativo && row.valido_ate >= hoje;
              return (
                <li key={row.id} className="surface-card grid gap-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{nomeDe(row.user_id)}</p>
                      <p className="text-xs text-muted-foreground">
                        Liberado em {formatarData(row.created_at)}
                      </p>
                    </div>
                    <Badge variant={valido ? "default" : "secondary"}>
                      {valido ? "Premium ativo" : row.ativo ? "Validade vencida" : "Desligado"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="grid gap-1.5">
                      <Label className="text-xs" htmlFor={`pu-data-${row.id}`}>
                        Válido até
                      </Label>
                      <Input
                        id={`pu-data-${row.id}`}
                        className="w-[160px]"
                        type="date"
                        value={row.valido_ate}
                        onChange={(e) => alterar.mutate({ id: row.id, valido_ate: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch
                        id={`pu-ativo-${row.id}`}
                        checked={row.ativo}
                        onCheckedChange={(v) => alterar.mutate({ id: row.id, ativo: v })}
                      />
                      <Label className="text-xs" htmlFor={`pu-ativo-${row.id}`}>
                        Ligado
                      </Label>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="ml-auto"
                      onClick={() => {
                        if (confirm("Retirar o Premium desta pessoa?")) remover.mutate(row.id);
                      }}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" /> Retirar
                    </Button>
                  </div>
                  {row.observacao && (
                    <p className="text-xs text-muted-foreground">{row.observacao}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Todos os pedidos Premium enviados pelo formulário da página inicial. */
export function AdminPedidosPremium({ onSelecionar }: { onSelecionar: (id: string) => void }) {
  const queryClient = useQueryClient();
  const pedidos = useQuery({
    queryKey: ["admin-pedidos-premium"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pedidos_destaque")
        .select("id,user_id,negocio,contato,mensagem,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const alterar = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("pedidos_destaque").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos-premium"] });
      queryClient.invalidateQueries({ queryKey: ["pedidos-destaque"] });
      toast.success("Pedido atualizado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const pendentes = (pedidos.data ?? []).filter((p) => p.status === "novo" || p.status === "em contato");
  return (
    <section className="grid gap-4">
      <h2 className="font-display text-lg font-bold">Pedidos de Premium ({pendentes.length})</h2>
      {pedidos.isError ? <p role="alert">Não foi possível carregar os pedidos.</p> : pedidos.isLoading ? <p>Carregando…</p> : pendentes.length === 0 ? <EstadoVazio texto="Nenhum pedido de Premium aguardando atendimento." /> : (
        <ul className="grid gap-3">
          {pendentes.map((p) => <li key={p.id} className="surface-card grid gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2"><strong>{p.negocio}</strong><Badge variant="secondary">{p.status}</Badge><span className="text-xs text-muted-foreground">{formatarData(p.created_at)}</span></div>
            <p className="text-sm">Contato: {p.contato}</p>
            {p.mensagem && <p className="whitespace-pre-line text-sm text-muted-foreground">{p.mensagem}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={alterar.isPending} onClick={() => alterar.mutate({ id: p.id, status: "em contato" })}>Em contato</Button>
              <Button size="sm" onClick={() => { onSelecionar(p.user_id); document.getElementById("premium-usuarios")?.scrollIntoView({ behavior: "smooth" }); }}>Selecionar pessoa</Button>
              <Button size="sm" variant="outline" disabled={alterar.isPending} onClick={() => alterar.mutate({ id: p.id, status: "aprovado" })}>Concluir pedido</Button>
              <Button size="sm" variant="outline" disabled={alterar.isPending} onClick={() => alterar.mutate({ id: p.id, status: "recusado" })}>Recusar pedido</Button>
            </div>
          </li>)}
        </ul>
      )}
    </section>
  );
}

const ROTULOS_PUBLICACOES: Record<(typeof TABELAS_MODERADAS)[number], string> = {
  comercios: "Comércio ou serviço público", vagas: "Vaga de emprego", imoveis: "Imóvel",
  sugestoes: "Melhoria", acoes: "Doação ou ação",
};

export function AdminPublicacoesPendentes() {
  const queryClient = useQueryClient();
  const pendentes = useQuery({
    queryKey: ["admin-publicacoes-pendentes"],
    queryFn: async () => {
      const resultados = await Promise.all(TABELAS_MODERADAS.map(async (tabela) => {
        const { data, error } = await supabase.from(tabela).select("*").eq("aprovado", false).order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []).map((item) => ({ ...item, tabela, titulo: "nome" in item ? item.nome : item.titulo }));
      }));
      return resultados.flat().sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });
  const decidir = useMutation({
    mutationFn: async ({ tabela, id, aprovar }: { tabela: (typeof TABELAS_MODERADAS)[number]; id: string; aprovar: boolean }) => {
      const { error } = aprovar
        ? await supabase.from(tabela).update({ aprovado: true }).eq("id", id)
        : await supabase.from(tabela).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_result, { tabela, aprovar }) => {
      toast.success(aprovar ? "Cadastro aprovado e publicado." : "Cadastro recusado e removido.");
      for (const key of [["admin-publicacoes-pendentes"], [tabela], ["minhas-publicacoes"], ["admin-comercios"], ["comercios-premium"]]) queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const lista = pendentes.data ?? [];
  return <section className="grid gap-4">
    <h2 className="font-display text-lg font-bold">Cadastros aguardando aprovação ({lista.length})</h2>
    {pendentes.isError ? <p role="alert">Não foi possível carregar os cadastros pendentes.</p> : pendentes.isLoading ? <p>Carregando…</p> : lista.length === 0 ? <EstadoVazio texto="Nenhum cadastro esperando aprovação." /> : (
      <ul className="grid gap-3">{lista.map((item) => <li key={`${item.tabela}-${item.id}`} className="surface-card grid gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2"><strong>{item.titulo}</strong><Badge variant="outline">{ROTULOS_PUBLICACOES[item.tabela]}</Badge><span className="text-xs text-muted-foreground">{formatarData(item.created_at)}</span></div>
        <div className="grid gap-1 text-sm text-muted-foreground">
          {Object.entries(item).filter(([key, value]) => !["id", "user_id", "aprovado", "created_at", "updated_at", "imagem_url", "fotos_extras", "tabela", "titulo"].includes(key) && value !== null && value !== "" && typeof value !== "object").map(([key, value]) => <p key={key}><span className="font-medium">{key.replaceAll("_", " ")}: </span>{String(value)}</p>)}
        </div>
        {"imagem_url" in item && typeof item.imagem_url === "string" && <SiteImage path={item.imagem_url} alt={item.titulo} className="h-36 w-52" />}
        <div className="flex gap-2"><Button size="sm" disabled={decidir.isPending} onClick={() => decidir.mutate({ tabela: item.tabela, id: item.id, aprovar: true })}><Check className="mr-1 h-4 w-4" /> Aprovar</Button>
        <Button size="sm" variant="outline" disabled={decidir.isPending} onClick={() => { if (confirm("Recusar e remover este cadastro?")) decidir.mutate({ tabela: item.tabela, id: item.id, aprovar: false }); }}><X className="mr-1 h-4 w-4" /> Recusar</Button></div>
      </li>)}</ul>
    )}
  </section>;
}

type NovidadeRow = {
  id: string;
  user_id: string;
  titulo: string;
  texto: string | null;
  categoria: string;
  imagem_url: string | null;
  canal: "novidades" | "feed";
  aprovado: boolean;
  created_at: string;
};

/** Fila de aprovação: nada aparece no site antes do admin liberar. */
export function AdminNovidadesPendentes() {
  const queryClient = useQueryClient();

  const pendentes = useQuery({
    queryKey: ["admin-novidades-pendentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("novidades")
        .select("id,user_id,titulo,texto,categoria,imagem_url,canal,aprovado,created_at")
        .eq("aprovado", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NovidadeRow[];
    },
  });

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-novidades-pendentes"] });
    queryClient.invalidateQueries({ queryKey: ["novidades"] });
    queryClient.invalidateQueries({ queryKey: ["feed-aprovado"] });
    queryClient.invalidateQueries({ queryKey: ["destaques-premium"] });
  };

  const aprovar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("novidades").update({ aprovado: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Publicação aprovada e já visível no site.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível aprovar."),
  });

  const recusar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("novidades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Publicação recusada e removida.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível recusar."),
  });

  const lista = pendentes.data ?? [];

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="font-display text-lg font-bold">
          Novidades aguardando aprovação{" "}
          <span className="text-sm font-medium text-muted-foreground">({lista.length})</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Ser Premium dá o direito de enviar a publicação — ela só aparece no site depois que você
          aprova aqui.
        </p>
      </div>

      {pendentes.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : lista.length === 0 ? (
        <EstadoVazio texto="Nenhuma publicação esperando aprovação." />
      ) : (
        <ul className="grid gap-3">
          {lista.map((row) => (
            <li
              key={row.id}
              className="surface-card flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap"
            >
              {row.imagem_url ? (
                <SiteImage
                  path={row.imagem_url}
                  alt={row.titulo}
                  className="h-20 w-28 shrink-0 overflow-hidden rounded-xl"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{row.titulo}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{row.categoria}</Badge>
                  <Badge variant="outline">
                    {row.canal === "feed" ? "Feed" : "Carrossel de Novidades"}
                  </Badge>
                  <span>{formatarData(row.created_at)}</span>
                </div>
                {row.texto ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.texto}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={aprovar.isPending}
                  onClick={() => aprovar.mutate(row.id)}
                >
                  <Check className="mr-1.5 h-4 w-4" /> Aprovar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("Recusar e remover esta publicação?")) recusar.mutate(row.id);
                  }}
                >
                  <X className="mr-1.5 h-4 w-4" /> Recusar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
