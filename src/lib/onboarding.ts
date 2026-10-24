export type TipoCadastroGratuito = "comercio" | "vaga" | "imovel" | "acao";

export const CADASTROS_GRATUITOS = [
  { tipo: "comercio", label: "Comércio ou Serviço", tabela: "comercios", titulo: "Cadastrar comércio ou serviço" },
  { tipo: "vaga", label: "Vaga de emprego", tabela: "vagas", titulo: "Publicar uma vaga" },
  { tipo: "imovel", label: "Aluguel ou venda de imóvel", tabela: "imoveis", titulo: "Anunciar um imóvel" },
  { tipo: "acao", label: "Doação ou ação comunitária", tabela: "acoes", titulo: "Criar uma ação comunitária" },
] as const;

export function deveMostrarOnboarding(perfil: { cadastro_completo_em: string | null; onboarding_concluido: boolean } | null | undefined) {
  return Boolean(perfil?.cadastro_completo_em && !perfil.onboarding_concluido);
}

export const AVISO_CADASTRO_GRATUITO = "Cadastrar comércio, serviço, vaga, imóvel ou doação é gratuito. Publicar no Feed e em Novidades exige o plano Premium. Todos os cadastros passam pela aprovação da administração.";