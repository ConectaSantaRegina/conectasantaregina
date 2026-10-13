import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cadastroPerfilSchema } from "@/lib/perfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CompletarPerfil() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [morador, setMorador] = useState<"sim" | "nao" | "">("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const perfil = useQuery({
    queryKey: ["meu-perfil-cadastro", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles")
        .select("id,nome,whatsapp,morador,cadastro_completo_em").eq("id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setNome(perfil.data?.nome ?? user?.user_metadata?.["full_name"] ?? "");
    setWhatsapp(perfil.data?.whatsapp ?? "");
    setMorador(perfil.data?.morador === true ? "sim" : perfil.data?.morador === false ? "nao" : "");
    setErro("");
  }, [perfil.data, user?.id]);

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    if (!user || salvando) return;
    const resultado = cadastroPerfilSchema.safeParse({ nome, whatsapp, morador });
    if (!resultado.success) {
      setErro(resultado.error.issues[0]?.message ?? "Confira seus dados.");
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id, nome: resultado.data.nome, whatsapp: resultado.data.whatsapp,
        morador: resultado.data.morador === "sim", cadastro_completo_em: new Date().toISOString(),
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["meu-perfil-cadastro", user.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-perfis"] });
      toast.success("Cadastro concluído!");
    } catch {
      setErro("Não foi possível salvar seus dados. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return <Dialog open={Boolean(user && !perfil.isPending && !perfil.data?.cadastro_completo_em)}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto [&>button]:hidden"
      onEscapeKeyDown={(event) => event.preventDefault()} onPointerDownOutside={(event) => event.preventDefault()}>
      <DialogHeader><DialogTitle>Complete seu cadastro</DialogTitle>
        <DialogDescription>Seus dados de contato ficam disponíveis somente para você e a administração.</DialogDescription>
      </DialogHeader>
      {perfil.isError ? <div className="grid gap-3"><p role="alert">Não foi possível carregar seu cadastro.</p>
        <Button onClick={() => perfil.refetch()}>Tentar novamente</Button></div> :
        <form onSubmit={salvar} className="grid gap-4">
          <div className="grid gap-2"><Label htmlFor="perfil-nome">Nome completo</Label>
            <Input id="perfil-nome" autoComplete="name" value={nome} maxLength={120} required onChange={(e) => setNome(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="perfil-whatsapp">WhatsApp com DDD</Label>
            <Input id="perfil-whatsapp" type="tel" autoComplete="tel" placeholder="(47) 99999-9999" value={whatsapp} maxLength={20} required onChange={(e) => setWhatsapp(e.target.value)} /></div>
          <fieldset className="grid gap-2"><legend className="mb-2 text-sm font-medium">Você mora no bairro Santa Regina?</legend>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="perfil-morador" value="sim" required checked={morador === "sim"} onChange={() => setMorador("sim")} />Sim, sou morador(a)</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="perfil-morador" value="nao" required checked={morador === "nao"} onChange={() => setMorador("nao")} />Não moro no bairro</label>
          </fieldset>
          {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
          <Button type="submit" disabled={salvando}>{salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Concluir cadastro</Button>
        </form>}
      <div><Button className="w-full" variant="ghost" disabled={salvando} onClick={() => signOut()}>Sair da conta</Button></div>
    </DialogContent>
  </Dialog>;
}