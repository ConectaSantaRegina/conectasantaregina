import { Link } from "@tanstack/react-router";
import { CalendarDays, Crown, ImagePlus, Info, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicarDialog } from "@/components/site/PublicarDialog";
import { SiteImage } from "@/components/site/SiteImage";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { CAMPOS } from "@/lib/campos";
import { formatarData, txt, useFeedAprovado } from "@/lib/dados";

const REGRA_CONTEUDO =
  "Publique assuntos relacionados às categorias do site: comércio, serviços, saúde, empregos, imóveis e ações do bairro. Notícias úteis para Santa Regina são bem-vindas, mas não fofocas, intrigas ou conteúdo alarmista.";

export function FeedComunidade() {
  const { user } = useAuth();
  const { podePublicarNovidades, carregando: carregandoPremium } = usePremium();
  const { data: publicacoes, isLoading } = useFeedAprovado();

  return (
    <section className="border-b bg-background" aria-labelledby="titulo-feed">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase text-primary">Santa Regina em movimento</p>
          <h2 id="titulo-feed" className="mt-1 font-display text-2xl font-extrabold md:text-3xl">
            Feed da comunidade
          </h2>
        </div>

        {!carregandoPremium && podePublicarNovidades ? (
          <div className="surface-card mb-6 overflow-hidden">
            <div className="flex items-center gap-3 p-4 sm:p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <PublicarDialog
                tabela="novidades"
                rotulo="O que você quer compartilhar com o bairro?"
                titulo="Publicar no feed"
                descricao="Sua publicação será analisada antes de aparecer para a comunidade."
                campos={CAMPOS.novidades ?? []}
                extra={{ canal: "feed" }}
                mensagemSucesso="Publicação enviada! Ela aparecerá no feed depois da aprovação."
                gatilho={
                  <Button
                    variant="outline"
                    className="h-auto min-h-11 flex-1 justify-start whitespace-normal rounded-full px-4 py-2 text-left text-muted-foreground"
                  >
                    O que você quer compartilhar com o bairro?
                  </Button>
                }
              />
            </div>
            <div className="flex gap-2 border-t bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>{REGRA_CONTEUDO}</p>
            </div>
          </div>
        ) : !carregandoPremium ? (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <Crown className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Quer publicar no feed?</p>
                <p className="text-sm text-muted-foreground">
                  O envio de publicações está disponível para contas Premium.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/contato">Quero publicar no feed</Link>
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            Carregando publicações…
          </div>
        ) : (publicacoes ?? []).length === 0 ? (
          <div className="surface-card grid justify-items-center gap-2 p-8 text-center">
            <ImagePlus className="h-7 w-7 text-primary" />
            <p className="font-semibold">O feed está começando</p>
            <p className="text-sm text-muted-foreground">
              As publicações aprovadas da comunidade aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {(publicacoes ?? []).map((item) => (
              <article key={item.id} className="surface-card overflow-hidden">
                <header className="flex items-center justify-between gap-3 p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
                      SR
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">Comunidade Santa Regina</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatarData(item.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {txt(item, "categoria")}
                  </Badge>
                </header>

                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <h3 className="font-display text-lg font-bold">{txt(item, "titulo")}</h3>
                  {txt(item, "texto") ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {txt(item, "texto")}
                    </p>
                  ) : null}
                </div>

                {txt(item, "imagem_url") ? (
                  <SiteImage
                    path={txt(item, "imagem_url")}
                    alt={txt(item, "titulo")}
                    className="aspect-[4/3] w-full sm:aspect-[16/10]"
                  />
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}