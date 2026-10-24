import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Store, BriefcaseBusiness, House, HeartHandshake, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormularioRegistro } from "@/components/site/PublicarDialog";
import { useAuth } from "@/hooks/useAuth";
import { usePerfilCadastro } from "@/hooks/usePerfilCadastro";
import { supabase } from "@/integrations/supabase/client";
import { CAMPOS, camposLocal } from "@/lib/campos";
import { AVISO_CADASTRO_GRATUITO, CADASTROS_GRATUITOS, deveMostrarOnboarding, type TipoCadastroGratuito } from "@/lib/onboarding";

const CadastroContext = createContext<(() => void) | null>(null);
const INTENCAO = "conecta-cadastro-gratis";
const ICONES = { comercio: Store, vaga: BriefcaseBusiness, imovel: House, acao: HeartHandshake };

export function CadastroGratisButton() {
  const abrir = useContext(CadastroContext);
  const { user, loading } = useAuth();
  const perfil = usePerfilCadastro();
  return <Button size="lg" disabled={loading || Boolean(user && perfil.isPending)} className="h-auto max-w-full whitespace-normal py-3 text-center" onClick={() => abrir?.()}>
    Tem comércio, imovél, vaga ou doação? Cadastre grátis
  </Button>;
}

export function CadastroInicialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const perfil = usePerfilCadastro();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<"pergunta" | "opcoes" | TipoCadastroGratuito | null>(null);
  const apresentado = useRef<string | null>(null);

  async function registrarConclusao() {
    if (!user || perfil.data?.onboarding_concluido) return;
    const { error } = await supabase.from("profiles").update({ onboarding_concluido: true }).eq("id", user.id);
    if (error) {
      toast.error("Não foi possível salvar sua escolha. Tente novamente.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["meu-perfil-cadastro", user.id] });
  }

  useEffect(() => {
    if (!user) {
      apresentado.current = null;
      setEtapa(null);
      return;
    }
    if (!perfil.data?.cadastro_completo_em) return;
    const solicitado = sessionStorage.getItem(INTENCAO) === "sim";
    if (solicitado || (deveMostrarOnboarding(perfil.data) && apresentado.current !== user.id)) {
      sessionStorage.removeItem(INTENCAO);
      apresentado.current = user.id;
      setEtapa("pergunta");
      void registrarConclusao();
    }
  }, [user?.id, perfil.data]);

  function abrir() {
    if (!user || !perfil.data?.cadastro_completo_em) {
      sessionStorage.setItem(INTENCAO, "sim");
      if (!user) void navigate({ to: "/entrar" });
      return;
    }
    setEtapa("pergunta");
    void registrarConclusao();
  }

  function concluir() {
    setEtapa(null);
    void registrarConclusao();
    void navigate({ to: "/" });
  }

  const cadastro = CADASTROS_GRATUITOS.find((item) => item.tipo === etapa);
  return <CadastroContext.Provider value={abrir}>
    {children}
    <Dialog open={Boolean(etapa && user && perfil.data?.cadastro_completo_em)} onOpenChange={(open) => { if (!open) concluir(); }}>
      {cadastro ? <FormularioRegistro key={cadastro.tipo} tabela={cadastro.tabela} titulo={cadastro.titulo}
        descricao={AVISO_CADASTRO_GRATUITO} campos={cadastro.tipo === "comercio" ? camposLocal("comercio") : CAMPOS[cadastro.tabela] ?? []}
        extra={cadastro.tipo === "comercio" ? { secao: "comercio" } : undefined}
        rotuloSalvar="Enviar para aprovação" onPronto={concluir} /> :
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-5 leading-snug">{etapa === "opcoes" ? "O que você quer cadastrar?" : "Você tem algum comércio, serviço, vaga ou imóvel para cadastrar no bairro?"}</DialogTitle>
            <DialogDescription>{AVISO_CADASTRO_GRATUITO}</DialogDescription>
          </DialogHeader>
          {etapa === "opcoes" ? <div className="grid gap-3">
            {CADASTROS_GRATUITOS.map((item) => {
              const Icone = ICONES[item.tipo];
              return <Button key={item.tipo} variant="outline" className="h-auto min-h-12 justify-start whitespace-normal py-3 text-left" onClick={() => setEtapa(item.tipo)}>
                <Icone className="h-5 w-5 shrink-0" /><span className="flex-1">{item.label}</span><ArrowRight className="h-4 w-4 shrink-0" />
              </Button>;
            })}
            <Button variant="ghost" onClick={() => setEtapa("pergunta")}><ArrowLeft className="h-4 w-4" />Voltar</Button>
          </div> : <div className="grid gap-3">
            <Button className="h-auto whitespace-normal py-3" onClick={() => { void registrarConclusao(); setEtapa("opcoes"); }}>Sim, quero cadastrar</Button>
            <Button variant="outline" className="h-auto whitespace-normal py-3" onClick={concluir}>Não, quero conhecer melhor o meu bairro</Button>
          </div>}
        </DialogContent>}
    </Dialog>
  </CadastroContext.Provider>;
}