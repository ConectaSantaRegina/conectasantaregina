import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero, Secao } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar no Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Entre ou crie sua conta com o Google para publicar no Conecta Santa Regina.",
      },
      { property: "og:title", content: "Entrar no Conecta Santa Regina" },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Acesse com o Google sua conta no portal do bairro Santa Regina.",
      },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  async function entrarComGoogle() {
    if (carregando) return;
    setCarregando(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar com o Google. Tente novamente.");
        return;
      }
      if (result.redirected) return;
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast.error("Não foi possível confirmar seu acesso. Tente novamente.");
        return;
      }
      await navigate({ to: "/" });
    } catch {
      toast.error("Não foi possível entrar com o Google. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <PageHero
        titulo="Entrar ou criar conta"
        subtitulo="Sua conta serve para cadastrar seu comércio, publicar vagas, imóveis e ações do bairro."
      />
      <Secao>
        <div className="surface-card mx-auto max-w-md p-6 md:p-8">
          <Button
            variant="secondary"
            className="w-full"
            onClick={entrarComGoogle}
            disabled={carregando}
            aria-busy={carregando}
          >
            {carregando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />}
            Continuar com o Google
          </Button>
        </div>
      </Secao>
    </div>
  );
}
