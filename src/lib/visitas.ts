const ROBO = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|preview|curl|wget|python|scrapy/i;

/** Robôs e buscadores não contam visitas. */
export function ehRobo(userAgent: string) {
  return !userAgent || ROBO.test(userAgent);
}

/** Identificador anônimo do navegador (UUID), salvo uma única vez. */
export function visitanteAnonimo(storage: Pick<Storage, "getItem" | "setItem">, gerar: () => string) {
  const chave = "csr-visitante";
  const atual = storage.getItem(chave);
  if (atual && /^[0-9a-f-]{36}$/.test(atual)) return atual;
  const novo = gerar();
  storage.setItem(chave, novo);
  return novo;
}

/** Evita repetir o registro no mesmo dia e na mesma aba (cliques repetidos). */
export function jaRegistradoHoje(storage: Pick<Storage, "getItem" | "setItem">, chave: string, hoje: string) {
  const k = `csr-vis:${chave}`;
  if (storage.getItem(k) === hoje) return true;
  storage.setItem(k, hoje);
  return false;
}

export function formatarVisitas(n: number) {
  return n.toLocaleString("pt-BR");
}
