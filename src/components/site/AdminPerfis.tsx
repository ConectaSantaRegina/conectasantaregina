import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MessageCircle, Crown } from "lucide-react";
import { useAdminPremium } from "@/hooks/useAdminPremium";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { linkWhatsapp } from "@/lib/dados";
import { normalizarPesquisa } from "@/lib/perfil";

export function usePerfisAdmin() {
  return useQuery({
    queryKey: ["admin-perfis"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles")
        .select("id,nome,whatsapp,morador,created_at,cadastro_completo_em").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

type PerfilAdmin = NonNullable<ReturnType<typeof usePerfisAdmin>["data"]>[number];

export function perfilCorresponde(perfil: PerfilAdmin, pesquisa: string) {
  const texto = normalizarPesquisa(pesquisa);
  const numeros = pesquisa.replace(/\D/g, "");
  return normalizarPesquisa(perfil.nome).includes(texto) || Boolean(numeros && perfil.whatsapp?.includes(numeros));
}

function DadosPerfil({ perfil }: { perfil: PerfilAdmin }) {
  const url = linkWhatsapp(perfil.whatsapp);
  return <div className="grid gap-2 text-sm">
    <p className="font-semibold break-words">{perfil.nome || "Nome não informado"}</p>
    <p className="text-muted-foreground">{perfil.morador === true ? "Morador(a) de Santa Regina" : perfil.morador === false ? "Não mora em Santa Regina" : "Moradia não informada"}</p>
    <div className="flex flex-wrap items-center gap-2"><span>WhatsApp: {perfil.whatsapp || "Não informado"}</span>
      {url && <Button asChild variant="outline" size="sm"><a href={url} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" />Entrar em contato</a></Button>}</div>
  </div>;
}

export function ContatoAutor({ userId }: { userId: string }) {
  const perfis = usePerfisAdmin();
  const perfil = perfis.data?.find((p) => p.id === userId);
  if (perfis.isPending) return <p className="text-sm text-muted-foreground">Carregando autor…</p>;
  if (!perfil) return <p className="text-sm text-muted-foreground">Dados do autor indisponíveis.</p>;
  return <div className="my-2 border-l-2 border-primary pl-3"><DadosPerfil perfil={perfil} /></div>;
}

export function AdminPerfis({ onSelecionar }: { onSelecionar: (id: string) => void }) {
  const perfis = usePerfisAdmin();
  const premium = useAdminPremium();
  const [pesquisa, setPesquisa] = useState("");
  const hoje = new Date().toISOString().slice(0, 10);
  const lista = (perfis.data ?? []).filter((p) => perfilCorresponde(p, pesquisa));
  return <section className="grid gap-4">
    <div className="flex flex-wrap items-end justify-between gap-4">
    <h2 className="font-display text-lg font-bold">Pessoas cadastradas ({lista.length})</h2>
    <div className="grid w-full gap-2 sm:max-w-lg"><Label htmlFor="pesquisa-perfis">Buscar por nome ou WhatsApp</Label>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input id="pesquisa-perfis" type="search" className="pl-9" placeholder="Nome ou número de WhatsApp" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} /></div></div></div>
    {perfis.isError ? <p role="alert">Não foi possível carregar os perfis.</p> : perfis.isPending ? <p>Carregando…</p> : lista.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum perfil encontrado.</p> :
      <ul className="grid gap-3 sm:grid-cols-2">{lista.map((p) => {
        const plano = premium.data?.find((row) => row.user_id === p.id);
        const ativo = Boolean(plano?.ativo && plano.valido_ate >= hoje);
        return <li key={p.id} className="surface-card grid gap-3 p-4">
        <DadosPerfil perfil={p} /><div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={p.cadastro_completo_em ? "secondary" : "outline"}>{p.cadastro_completo_em ? "Cadastro completo" : "Dados pendentes"}</Badge>
          <Badge variant={ativo ? "default" : "outline"}>{ativo ? "Premium ativo" : plano ? plano.ativo ? "Premium vencido" : "Premium desligado" : "Perfil grátis"}</Badge>
          {plano && <p className="w-full text-xs text-muted-foreground">Validade: {new Date(`${plano.valido_ate}T12:00:00`).toLocaleDateString("pt-BR")}</p>}
          <Button size="sm" disabled={premium.isPending || premium.isError} onClick={() => onSelecionar(p.id)}><Crown className="mr-1.5 h-4 w-4" />{plano ? "Gerenciar Premium" : "Ativar Premium"}</Button>
        </div></li>;
      })}</ul>}
    {premium.isError && <p role="alert" className="text-sm text-destructive">Não foi possível carregar o status Premium.</p>}
  </section>;
}