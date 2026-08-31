import type { Campo } from "@/components/site/PublicarDialog";
import type { Tabela } from "@/lib/dados";
import {
  CATEGORIAS_COMERCIO,
  CATEGORIAS_NOVIDADES,
  CATEGORIAS_SERVICOS_PUBLICOS,
} from "@/lib/nav";

export const TIPOS_VAGA = ["Efetivo", "Temporário", "Freelance", "Estágio", "Bico"];
export const TIPOS_ACAO = ["Doação", "Mutirão", "Campanha", "Evento solidário", "Voluntariado"];
export const FINALIDADES_IMOVEL = ["Aluguel", "Venda"];
export const TIPOS_IMOVEL = [
  "Casa",
  "Apartamento",
  "Quarto",
  "Sala comercial",
  "Terreno",
  "Galpão",
];

export type Secao = "comercio" | "publico";

export const SECOES: { value: Secao; label: string }[] = [
  { value: "comercio", label: "Comércio e Serviços" },
  { value: "publico", label: "Serviços Públicos" },
];

const CAMPOS_LOCAL_BASE: Campo[] = [
  { name: "descricao", label: "Descrição", type: "textarea" },
  { name: "endereco", label: "Endereço" },
  { name: "horario", label: "Horário de funcionamento", type: "horarios", max: 400 },
  { name: "telefone", label: "Telefone" },
  { name: "whatsapp", label: "WhatsApp (só números)" },
  { name: "instagram", label: "Instagram (@)" },
  { name: "delivery", label: "Faz entrega (delivery)", type: "switch" },
  { name: "imagem_url", label: "Foto do local", type: "image" },
];

/** Campos de cadastro de um local, com as categorias da aba correspondente. */
export function camposLocal(secao: Secao): Campo[] {
  return [
    { name: "nome", label: "Nome do local", required: true },
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: secao === "publico" ? CATEGORIAS_SERVICOS_PUBLICOS : CATEGORIAS_COMERCIO,
      allowCustom: true,
      required: true,
    },
    ...CAMPOS_LOCAL_BASE,
  ];
}

/** Campos usados tanto para publicar como para editar cada tipo de conteúdo. */
export const CAMPOS: Partial<Record<Tabela, Campo[]>> = {
  comercios: [
    { name: "nome", label: "Nome do local", required: true },
    {
      name: "secao",
      label: "Aparece na aba",
      type: "select",
      options: SECOES.map((s) => s.value),
      optionLabels: Object.fromEntries(SECOES.map((s) => [s.value, s.label])),
      required: true,
    },
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: [...CATEGORIAS_COMERCIO, ...CATEGORIAS_SERVICOS_PUBLICOS],
      allowCustom: true,
      required: true,
    },
    ...CAMPOS_LOCAL_BASE,
  ],

  vagas: [
    { name: "titulo", label: "Cargo ou serviço", required: true },
    { name: "empresa", label: "Empresa ou responsável" },
    { name: "tipo", label: "Tipo", type: "select", options: TIPOS_VAGA, required: true },
    { name: "salario", label: "Remuneração" },
    { name: "descricao", label: "Descrição e requisitos", type: "textarea" },
    { name: "contato", label: "Contato (telefone, WhatsApp ou e-mail)", required: true },
  ],
  novidades: [
    { name: "titulo", label: "Título", required: true },
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: CATEGORIAS_NOVIDADES,
      required: true,
    },
    { name: "texto", label: "Detalhes", type: "textarea", max: 4000 },
    { name: "imagem_url", label: "Imagem", type: "image" },
  ],
  imoveis: [
    { name: "titulo", label: "Título do anúncio", required: true },
    {
      name: "finalidade",
      label: "Finalidade",
      type: "select",
      options: FINALIDADES_IMOVEL,
      required: true,
    },
    { name: "tipo", label: "Tipo", type: "select", options: TIPOS_IMOVEL, required: true },
    { name: "preco", label: "Valor" },
    { name: "endereco", label: "Endereço ou região" },
    { name: "descricao", label: "Descrição", type: "textarea" },
    { name: "contato", label: "Contato", required: true },
    { name: "imagem_url", label: "Foto do imóvel", type: "image" },
  ],
  acoes: [
    { name: "titulo", label: "Nome da ação", required: true },
    { name: "tipo", label: "Tipo", type: "select", options: TIPOS_ACAO, required: true },
    { name: "descricao", label: "Descrição", type: "textarea", max: 3000 },
    { name: "meta", label: "Meta (ex.: 200 cestas)" },
    { name: "local", label: "Local e data" },
    { name: "contato", label: "Contato do organizador", required: true },
    { name: "imagem_url", label: "Imagem da ação", type: "image" },
  ],
  sugestoes: [
    { name: "titulo", label: "Sua proposta", required: true },
    { name: "local", label: "Local no bairro" },
    { name: "descricao", label: "Detalhes", type: "textarea", max: 3000 },
  ],
};
