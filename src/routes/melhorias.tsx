import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ThumbsUp } from "lucide-react";
import { LinkEndereco } from "@/components/site/LinkEndereco";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotaoApagar } from "@/components/site/CardItem";
import { EstadoVazio, PageHero, Secao } from "@/components/site/PageHero";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { CAMPOS } from "@/lib/campos";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  formatarData,
  inserirRegistro,
  txt,
  useInvalidar,
  useLista,
  type Registro,
} from "@/lib/dados";

export const Route = createFileRoute("/melhorias")({
  head: () => ({
    meta: [
      { title: "Propor melhorias para o bairro Santa Regina" },
      {
        name: "description",
        content:
          "Sugira melhorias para Santa Regina, veja as ideias dos vizinhos e apoie as propostas que você quer ver acontecendo.",
      },
      { property: "og:title", content: "Propor melhorias para o bairro Santa Regina" },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content:
          "Ideias dos moradores para melhorar o bairro Santa Regina, com apoio da vizinhança.",
      },
    ],
  }),
  component: Melhorias,
});

function Melhorias() {
  const { data: sugestoes, isLoading } = useLista("sugestoes");
  const { data: apoios } = useLista("sugestao_apoios");

  return (
    <div>
      <PageHero
        titulo="Propor melhorias"
        subtitulo="Buraco na rua, iluminação, praça, coleta de lixo, transporte… escreva sua ideia e veja quantos vizinhos apoiam."
        acao={
          <PublicarDialog
            tabela="sugestoes"
            rotulo="Propor melhoria"
            titulo="Propor uma melhoria"
            descricao="Explique a ideia e onde ela deveria acontecer no bairro."
            campos={CAMPOS.sugestoes ?? []}
          />
        }
      />
      <Secao>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="surface-card h-40 animate-pulse bg-muted/60" />
            ))}
          </div>
        ) : (sugestoes ?? []).length === 0 ? (
          <EstadoVazio texto="Nenhuma proposta ainda. Comece você: toda mudança no bairro começa com uma ideia." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {(sugestoes ?? []).map((item) => (
              <CardSugestao key={item.id} sugestao={item} apoios={apoios ?? []} />
            ))}
          </div>
        )}
      </Secao>
    </div>
  );
}

function CardSugestao({ sugestao, apoios }: { sugestao: Registro; apoios: Registro[] }) {
  const { user } = useAuth();
  const invalidar = useInvalidar("sugestao_apoios");
  const daSugestao = apoios.filter((a) => txt(a, "sugestao_id") === sugestao.id);
  const meuApoio = daSugestao.find((a) => user && txt(a, "user_id") === user.id);

  async function alternarApoio() {
    if (!user) return;
    try {
      if (meuApoio) {
        const { error } = await supabase.from("sugestao_apoios").delete().eq("id", meuApoio.id);
        if (error) throw error;
      } else {
        await inserirRegistro("sugestao_apoios", {
          sugestao_id: sugestao.id,
          user_id: user.id,
        });
      }
      await invalidar();
    } catch {
      toast.error("Não foi possível registrar seu apoio agora.");
    }
  }

  return (
    <article className="surface-card flex flex-col gap-3 p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <h3 className="min-w-0 font-display text-lg font-bold">{txt(sugestao, "titulo")}</h3>
        <Badge variant="secondary" className="shrink-0">
          {txt(sugestao, "status") || "Em análise"}
        </Badge>
      </div>
      {txt(sugestao, "descricao") && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {txt(sugestao, "descricao")}
        </p>
      )}
      {txt(sugestao, "local") && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <LinkEndereco endereco={txt(sugestao, "local")} />
        </p>
      )}
      <p className="text-xs text-muted-foreground">{formatarData(sugestao.created_at)}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {user ? (
          <Button size="sm" variant={meuApoio ? "default" : "secondary"} onClick={alternarApoio}>
            <ThumbsUp className="mr-1.5 h-4 w-4" />
            {meuApoio ? "Apoiando" : "Apoiar"} · {daSugestao.length}
          </Button>
        ) : (
          <Button asChild size="sm" variant="secondary">
            <Link to="/entrar">Entre para apoiar · {daSugestao.length}</Link>
          </Button>
        )}
        <BotaoApagar registro={sugestao} tabela="sugestoes" />
      </div>
    </article>
  );
}
