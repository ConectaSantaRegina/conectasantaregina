export const NAV = [
  { to: "/", label: "Início" },
  { to: "/comercio", label: "Comércio e Delivery" },
  { to: "/saude", label: "Saúde e Serviços" },
  { to: "/empregos", label: "Empregos" },
  { to: "/imoveis", label: "Aluguel e Venda" },
  { to: "/novidades", label: "Novidades" },
  { to: "/melhorias", label: "Melhorias" },
  { to: "/acoes", label: "Doações e Ações" },
  { to: "/contato", label: "Fale Conosco" },
] as const;

export const CATEGORIAS_COMERCIO = [
  "Mercado e Padaria",
  "Restaurante e Lanchonete",
  "Delivery",
  "Loja e Vestuário",
  "Serviços",
  "Pet",
  "Outros",
];

export const CATEGORIAS_SAUDE = [
  "Farmácia",
  "Posto de Saúde",
  "Clínica",
  "Odontologia",
  "Salão de Beleza",
  "Barbearia",
  "Academia",
  "Outros",
];

export const CATEGORIAS_NOVIDADES = ["Promoção", "Obra", "Evento", "Aviso", "Segurança"];
