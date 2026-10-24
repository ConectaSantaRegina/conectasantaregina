import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { PageHero, Secao } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { AdminPerfis } from "@/components/site/AdminPerfis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, ClipboardCheck } from "lucide-react";
import { useResumoVisitas } from "@/hooks/useVisitas";
import { formatarVisitas } from "@/lib/visitas";
import {
  AdminUsuariosPremium,
  AdminNovidadesPendentes,
  AdminPedidosPremium,
  AdminPublicacoesPendentes,
} from "@/components/site/AdminAprovacoes";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do administrador — Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Área restrita: gerencie o Premium das pessoas cadastradas e aprove as publicações do bairro.",
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


function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [pessoaSelecionada, setPessoaSelecionada] = useState("");
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

  return (
    <div>
      <PageHero
        titulo="Painel do administrador"
        subtitulo="Analise pedidos Premium e aprove cadastros e publicações antes de aparecerem no site. O pagamento é combinado por fora (PIX)."
      />
      <Secao>
        <ResumoVisitas />
        <Tabs defaultValue="aprovacoes" className="mb-12">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start" aria-label="Seções da administração">
            <TabsTrigger value="aprovacoes"><ClipboardCheck className="mr-2 h-4 w-4" />Aprovações</TabsTrigger>
            <TabsTrigger value="pessoas"><Users className="mr-2 h-4 w-4" />Pessoas</TabsTrigger>
          </TabsList>
          <TabsContent value="aprovacoes" className="grid gap-10">
            <AdminNovidadesPendentes />
            <AdminPublicacoesPendentes />
          </TabsContent>
          <TabsContent value="pessoas" className="grid gap-10">
            <AdminPedidosPremium onSelecionar={setPessoaSelecionada} />
            <AdminPerfis onSelecionar={setPessoaSelecionada} />
          </TabsContent>
        </Tabs>
        <Dialog open={Boolean(pessoaSelecionada)} onOpenChange={(aberto) => { if (!aberto) setPessoaSelecionada(""); }}>
          <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Premium</DialogTitle>
              <DialogDescription>Validade e liberação do Premium desta pessoa.</DialogDescription>
            </DialogHeader>
            {pessoaSelecionada && <AdminUsuariosPremium key={pessoaSelecionada} selecionado={pessoaSelecionada} onSelecionar={setPessoaSelecionada} compacto />}
          </DialogContent>
        </Dialog>
      </Secao>
    </div>
  );
}

function ResumoVisitas() {
  const { data, isError } = useResumoVisitas(true);
  const cards = [
    { titulo: "Visitas hoje", valor: data ? formatarVisitas(Number(data.hoje)) : "…" },
    { titulo: "Visitas nos últimos 30 dias", valor: data ? formatarVisitas(Number(data.ultimos_30)) : "…" },
    { titulo: "Categoria de comércio mais vista", valor: data ? (data.categoria_top ? `${data.categoria_top} (${formatarVisitas(Number(data.categoria_top_total))})` : "Sem dados ainda") : "…" },
  ];
  if (isError) return <p className="mb-6 text-sm text-muted-foreground">Não foi possível carregar o resumo de visitas.</p>;
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.titulo} className="surface-card p-5">
          <p className="text-sm text-muted-foreground">{c.titulo}</p>
          <p className="mt-1 font-display text-2xl font-extrabold break-words">{c.valor}</p>
        </div>
      ))}
    </div>
  );
}
