import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHero, Secao } from "@/components/site/PageHero";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar no Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Crie sua conta gratuita para cadastrar comércios, publicar vagas, novidades e apoiar melhorias no bairro Santa Regina.",
      },
      { property: "og:title", content: "Entrar no Conecta Santa Regina" },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Acesse sua conta para publicar no portal do bairro Santa Regina.",
      },
    ],
  }),
  component: Entrar,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido.").max(255),
  senha: z.string().min(6, "A senha precisa de ao menos 6 caracteres.").max(72),
});

const schemaCadastro = z.object({
  nome: z
    .string()
    .trim()
    .min(5, "Digite seu nome completo.")
    .max(120)
    .refine((v) => v.split(/\s+/).length >= 2, "Digite nome e sobrenome."),
  email: z.string().trim().email("E-mail inválido.").max(255),
  senha: z.string().regex(/^\d{6}$/, "A senha deve ter exatamente 6 dígitos numéricos."),
  morador: z.boolean(),
});

function Entrar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [morador, setMorador] = useState<"sim" | "nao" | "">("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  function validar() {
    const resultado = schema.safeParse({ email, senha });
    if (!resultado.success) {
      toast.error(resultado.error.issues[0]?.message ?? "Confira e-mail e senha.");
      return null;
    }
    return resultado.data;
  }


  async function entrar() {
    const dados = validar();
    if (!dados) return;
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    });
    setCarregando(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  }

  async function cadastrar() {
    if (morador === "") {
      toast.error("Diga se você mora no bairro.");
      return;
    }
    const resultado = schemaCadastro.safeParse({
      nome,
      email,
      senha,
      morador: morador === "sim",
    });
    if (!resultado.success) {
      toast.error(resultado.error.issues[0]?.message ?? "Confira os dados do cadastro.");
      return;
    }
    const dados = resultado.data;
    setCarregando(true);
    const { error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome: dados.nome, morador: dados.morador },
      },
    });
    setCarregando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conta criada! Confirme seu e-mail para começar a publicar.");
  }


  async function entrarComGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google agora.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div>
      <PageHero
        titulo="Entrar ou criar conta"
        subtitulo="Sua conta serve para cadastrar seu comércio, publicar vagas, novidades, imóveis e apoiar melhorias do bairro."
      />
      <Secao>
        <div className="surface-card mx-auto max-w-md p-6 md:p-8">
          <Button variant="secondary" className="w-full" onClick={entrarComGoogle}>
            Continuar com o Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou use seu e-mail
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="entrar">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="criar">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="entrar" className="grid gap-4 pt-6">
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <Button onClick={entrar} disabled={carregando}>
                {carregando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </TabsContent>

            <TabsContent value="criar" className="grid gap-4 pt-6">
              <div className="grid gap-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  autoComplete="name"
                  placeholder="Nome e sobrenome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email-novo">E-mail</Label>
                <Input
                  id="email-novo"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="senha-nova">Senha de 6 dígitos</Label>
                <Input
                  id="senha-nova"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  placeholder="******"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <p className="text-xs text-muted-foreground">Use 6 números, ex.: 123456.</p>
              </div>
              <div className="grid gap-2">
                <Label>Você mora no bairro Santa Regina?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={morador === "sim" ? "default" : "secondary"}
                    className="flex-1"
                    onClick={() => setMorador("sim")}
                  >
                    Sim, sou morador(a)
                  </Button>
                  <Button
                    type="button"
                    variant={morador === "nao" ? "default" : "secondary"}
                    className="flex-1"
                    onClick={() => setMorador("nao")}
                  >
                    Não moro no bairro
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quem não mora no bairro também pode se cadastrar — a pergunta é só para sabermos
                  quem usa o site.
                </p>
              </div>

              <Button onClick={cadastrar} disabled={carregando}>
                {carregando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Criar minha conta
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </Secao>
    </div>
  );
}
