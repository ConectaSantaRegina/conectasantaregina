import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Crown, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHero, Secao, EstadoVazio } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatarData } from "@/lib/dados";
import {
  AdminUsuariosPremium,
  AdminNovidadesPendentes,
} from "@/components/site/AdminAprovacoes";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do administrador — Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Área restrita: marque comércios como Premium com data de validade e acompanhe os destaques do bairro.",
      },
      { property: "og:title", content: "Painel do administrador — Conecta Santa Regina" },
      {
        property: "og:description",
        content: "Controle manual dos destaques Premium do Conecta Santa Regina.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

type PremiumRow = {
  id: string;
  user_id: string;
  comercio_id: string | null;
  valido_ate: string;
  ativo: boolean;
  observacao: string | null;
  created_at: string;
};

type ComercioRow = { id: string; nome: string; user_id: string; categoria: string | null };

function estaValido(row: PremiumRow) {
  const hoje = new Date().toISOString().slice(0, 10);
  return row.ativo && row.valido_ate >= hoje;
}

function dataEmDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  const comercios = useQuery({
    queryKey: ["admin-comercios"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comercios")
        .select("id,nome,user_id,categoria")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as ComercioRow[];
    },
  });

  const premium = useQuery({
    queryKey: ["admin-premium"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("premium")
        .select("id,user_id,comercio_id,valido_ate,ativo,observacao,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PremiumRow[];
    },
  });

  const [comercioId, setComercioId] = useState("");
  const [validoAte, setValidoAte] = useState(dataEmDias(30));
  const [observacao, setObservacao] = useState("");

  const nomePorComercio = useMemo(() => {
    const mapa = new Map<string, ComercioRow>();
    (comercios.data ?? []).forEach((c) => mapa.set(c.id, c));
    return mapa;
  }, [comercios.data]);

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-premium"] });
    queryClient.invalidateQueries({ queryKey: ["premium-ativos"] });
    queryClient.invalidateQueries({ queryKey: ["galerias-premium"] });
  };

  const salvar = useMutation({
    mutationFn: async () => {
      const comercio = nomePorComercio.get(comercioId);
      if (!comercio) throw new Error("Escolha um comércio da lista.");
      if (!validoAte) throw new Error("Informe a data de validade.");
      const { error } = await supabase.from("premium").upsert(
        {
          comercio_id: comercio.id,
          user_id: comercio.user_id,
          valido_ate: validoAte,
          ativo: true,
          observacao: observacao.trim() || null,
        },
        { onConflict: "comercio_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Premium atualizado.");
      setObservacao("");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar."),
  });

  const alterar = useMutation({
    mutationFn: async (payload: { id: string; valido_ate?: string; ativo?: boolean }) => {
      const { id, ...campos } = payload;
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
      toast.success("Premium removido. O cadastro do comércio continua no ar.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível remover."),
  });

  if (loading) {
    return (
      <Secao>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </Secao>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div>
        <PageHero
          titulo="Área restrita"
          subtitulo="Esta página é só para quem administra o Conecta Santa Regina."
        />
        <Secao>
          <div className="surface-card grid gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {user
                ? "Sua conta não tem permissão de administradora."
                : "Entre com a conta de administradora para continuar."}
            </p>
            {!user && (
              <div>
                <Button asChild>
                  <Link to="/entrar">Entrar</Link>
                </Button>
              </div>
            )}
          </div>
        </Secao>
      </div>
    );
  }

  const lista = premium.data ?? [];

  return (
    <div>
      <PageHero
        titulo="Painel do administrador"
        subtitulo="Libere pessoas e comércios como Premium (com data de validade) e aprove cada publicação antes de ela aparecer no site. O pagamento é combinado por fora (PIX) — aqui você só registra."
      />
      <Secao>
        <div className="mb-12 grid gap-12">
          <AdminNovidadesPendentes />
          <AdminUsuariosPremium />
        </div>
        <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)]">
          <form
            className="surface-card grid h-fit gap-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              salvar.mutate();
            }}
          >
            <h2 className="font-display text-lg font-bold">
              <Crown className="mr-1.5 inline h-4 w-4 text-primary" /> Marcar como Premium
            </h2>

            <div className="grid gap-2">
              <Label>Comércio</Label>
              <Select value={comercioId} onValueChange={setComercioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o comércio" />
                </SelectTrigger>
                <SelectContent>
                  {(comercios.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                      {c.categoria ? ` — ${c.categoria}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O Premium fica ligado ao dono do cadastro escolhido.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valido_ate">Válido até</Label>
              <Input
                id="valido_ate"
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
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex.: pago por PIX em 06/09, R$ 50"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={salvar.isPending || !comercioId}>
              {salvar.isPending ? "Salvando…" : "Salvar Premium"}
            </Button>
          </form>

          <section className="grid gap-4">
            <h2 className="font-display text-lg font-bold">
              Premium registrados{" "}
              <span className="text-sm font-medium text-muted-foreground">({lista.length})</span>
            </h2>

            {premium.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : lista.length === 0 ? (
              <EstadoVazio texto="Nenhum comércio marcado como Premium ainda." />
            ) : (
              <ul className="grid gap-3">
                {lista.map((row) => {
                  const comercio = row.comercio_id ? nomePorComercio.get(row.comercio_id) : null;
                  const valido = estaValido(row);
                  return (
                    <li key={row.id} className="surface-card grid gap-3 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {comercio?.nome ?? "Comércio removido"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registrado em {formatarData(row.created_at)}
                          </p>
                        </div>
                        <Badge variant={valido ? "default" : "secondary"}>
                          {valido
                            ? "Premium ativo"
                            : row.ativo
                              ? "Validade vencida"
                              : "Desligado"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-end gap-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs" htmlFor={`data-${row.id}`}>
                            Válido até
                          </Label>
                          <Input
                            id={`data-${row.id}`}
                            className="w-[160px]"
                            type="date"
                            value={row.valido_ate}
                            onChange={(e) =>
                              alterar.mutate({ id: row.id, valido_ate: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                          <Switch
                            id={`ativo-${row.id}`}
                            checked={row.ativo}
                            onCheckedChange={(v) => alterar.mutate({ id: row.id, ativo: v })}
                          />
                          <Label className="text-xs" htmlFor={`ativo-${row.id}`}>
                            Ligado
                          </Label>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                          onClick={() => {
                            if (
                              confirm(
                                "Remover o Premium deste comércio? O cadastro dele continua normal na aba de comércio.",
                              )
                            )
                              remover.mutate(row.id);
                          }}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" /> Remover
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
      </Secao>
    </div>
  );
}
