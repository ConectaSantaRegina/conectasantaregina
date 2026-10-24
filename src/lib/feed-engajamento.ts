export type MetricaFeed = { publicacao_id: string; curtidas: number; compartilhamentos: number };

export function somarMetricas(ids: string[], metricas: MetricaFeed[]) {
  const proprias = new Set(ids);
  return metricas.reduce((total, item) => proprias.has(item.publicacao_id)
    ? { curtidas: total.curtidas + item.curtidas, compartilhamentos: total.compartilhamentos + item.compartilhamentos }
    : total, { curtidas: 0, compartilhamentos: 0 });
}

export function dispositivoCompartilhamento(storage: Pick<Storage, "getItem" | "setItem">, gerar: () => string) {
  const chave = "conecta-feed-dispositivo";
  const atual = storage.getItem(chave);
  if (atual && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(atual)) return atual;
  const novo = gerar();
  storage.setItem(chave, novo);
  return novo;
}

export function linkPublicacao(origin: string, id: string) {
  return `${origin}/?publicacao=${encodeURIComponent(id)}#publicacao-${encodeURIComponent(id)}`;
}