import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero, Secao } from "@/components/site/PageHero";
import { inserirRegistro } from "@/lib/dados";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale com o Conecta Santa Regina" },
      {
        name: "description",
        content:
          "Envie sugestões, dúvidas ou avisos para a equipe do Conecta Santa Regina, o portal do nosso bairro.",
      },
      { property: "og:title", content: "Fale com o Conecta Santa Regina" },
      {
        property: "og:description",
        content: "Mande sua mensagem para quem cuida do portal do bairro Santa Regina.",
      },
    ],
  }),
  component: Contato,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Diga seu nome.").max(100),
  email: z.string().trim().email("E-mail inválido.").max(255).or(z.literal("")),
  telefone: z.string().trim().max(30),
  mensagem: z.string().trim().min(5, "Escreva sua mensagem.").max(2000),
});

function Contato() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const resultado = schema.safeParse(form);
    if (!resultado.success) {
      toast.error(resultado.error.issues[0]?.message ?? "Confira os dados do formulário.");
      return;
    }
    setEnviando(true);
    try {
      await inserirRegistro("mensagens_contato", {
        nome: resultado.data.nome,
        email: resultado.data.email || null,
        telefone: resultado.data.telefone || null,
        mensagem: resultado.data.mensagem,
      });
      toast.success("Mensagem enviada! Vamos responder em breve.");
      setForm({ nome: "", email: "", telefone: "", mensagem: "" });
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <PageHero
        titulo="Fale conosco"
        subtitulo="Dúvidas, sugestões sobre o site ou algum aviso importante para o bairro? Escreva pra gente."
      />
      <Secao>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="surface-card grid gap-4 p-6 md:p-8">
            <div className="grid gap-1.5">
              <Label htmlFor="nome">Seu nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                maxLength={100}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  maxLength={255}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone}
                  maxLength={30}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mensagem">Mensagem *</Label>
              <Textarea
                id="mensagem"
                rows={6}
                maxLength={2000}
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              />
            </div>
            <Button onClick={enviar} disabled={enviando} className="justify-self-start">
              {enviando && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Enviar mensagem
            </Button>
          </div>

          <aside className="grid gap-4 content-start">
            <div className="surface-card flex gap-3 p-6">
              <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold">Quer divulgar seu comércio?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  É gratuito. Crie sua conta e publique o cadastro na aba Comércio e Serviços.
                </p>
              </div>
            </div>
            <div className="surface-card flex gap-3 p-6">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold">Sobre o projeto</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  O Conecta Santa Regina é um espaço colaborativo mantido por moradores para
                  fortalecer o comércio local e a vida no bairro.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Secao>
    </div>
  );
}
