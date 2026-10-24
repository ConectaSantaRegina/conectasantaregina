import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { dispositivoCompartilhamento, linkPublicacao } from "@/lib/feed-engajamento";

type Props = { id: string; titulo: string; curtido: boolean; curtidas: number; compartilhamentos: number; carregando: boolean; atualizar: () => Promise<void> };

export function FeedInteracoes({ id, titulo, curtido, curtidas, compartilhamentos, carregando, atualizar }: Props) {
  const { user, loading } = useAuth();
  const [ocupado, setOcupado] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);
  const [convite, setConvite] = useState(false);

  async function curtir() {
    if (!user) { setConvite(true); return; }
    setOcupado(true);
    try {
      const { error } = curtido
        ? await supabase.from("feed_curtidas").delete().eq("publicacao_id", id).eq("user_id", user.id)
        : await supabase.from("feed_curtidas").insert({ publicacao_id: id, user_id: user.id });
      if (error && error.code !== "23505") throw error;
      await atualizar();
    } catch { toast.error("Não foi possível atualizar a curtida. Tente novamente."); }
    finally { setOcupado(false); }
  }

  async function compartilhar() {
    setCompartilhando(true);
    const url = linkPublicacao(window.location.origin, id);
    try {
      if (navigator.share) await navigator.share({ title: titulo, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copiado!"); }
      let dispositivo: string;
      try { dispositivo = dispositivoCompartilhamento(localStorage, () => crypto.randomUUID()); }
      catch { dispositivo = dispositivoCompartilhamento(sessionStorage, () => crypto.randomUUID()); }
      const { error } = await supabase.rpc("registrar_compartilhamento_feed", { p_publicacao: id, p_dispositivo: dispositivo });
      if (error) throw error;
      await atualizar();
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) toast.error("Não foi possível concluir o compartilhamento. Tente novamente.");
    } finally { setCompartilhando(false); }
  }

  return (
    <div className="border-t px-4 py-3 sm:px-5">
      <div className="flex items-center gap-5">
        <div className="flex min-w-20 items-center gap-1">
          <Button variant="ghost" size="icon" title={curtido ? "Descurtir" : "Curtir"} aria-label={curtido ? "Descurtir" : "Curtir"} aria-pressed={curtido} disabled={ocupado || loading || carregando} onClick={curtir} className={curtido ? "text-like hover:text-like" : "text-foreground"}>
            <Heart className={`size-6 transition-transform duration-200 motion-reduce:transition-none ${curtido ? "fill-current scale-110" : "scale-100"}`} />
          </Button>
          <span className="text-sm tabular-nums" aria-label={`${curtidas} curtidas`} aria-live="polite">{carregando ? "…" : curtidas}</span>
        </div>
        <div className="flex min-w-20 items-center gap-1">
          <Button variant="ghost" size="icon" title="Compartilhar" aria-label="Compartilhar" disabled={compartilhando} onClick={compartilhar}><Send className="size-6" /></Button>
          <span className="text-sm tabular-nums" aria-label={`${compartilhamentos} compartilhamentos`} aria-live="polite">{carregando ? "…" : compartilhamentos}</span>
        </div>
      </div>
      {convite && !user && <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm"><span>Entre ou crie sua conta para curtir.</span><Button asChild variant="link" className="h-auto px-0 py-1"><Link to="/entrar">Entrar ou criar conta</Link></Button></div>}
    </div>
  );
}