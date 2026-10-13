import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { PageHero, Secao } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
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
        <div className="mb-12 grid gap-12">
          <AdminPedidosPremium onSelecionar={setPessoaSelecionada} />
          <AdminNovidadesPendentes />
          <AdminPublicacoesPendentes />
          <div id="premium-usuarios">
            <AdminUsuariosPremium selecionado={pessoaSelecionada} onSelecionar={setPessoaSelecionada} />
          </div>
        </div>
      </Secao>
    </div>
  );
}
