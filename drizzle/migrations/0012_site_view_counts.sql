CREATE TABLE public.site_visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  visitante text NOT NULL,
  pagina text NOT NULL DEFAULT 'inicio',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dia, visitante, pagina)
);
GRANT ALL ON public.site_visitas TO service_role;
ALTER TABLE public.site_visitas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.publicacao_visualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacao_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('feed','comercio')),
  dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  visitante text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (publicacao_id, dia, visitante)
);
CREATE INDEX ON public.publicacao_visualizacoes (publicacao_id);
GRANT ALL ON public.publicacao_visualizacoes TO service_role;
ALTER TABLE public.publicacao_visualizacoes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._visitante_id(p_visitante text)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN RETURN 'u:' || auth.uid()::text; END IF;
  IF p_visitante IS NULL OR p_visitante !~ '^[0-9a-f-]{36}$' THEN RETURN NULL; END IF;
  RETURN 'a:' || p_visitante;
END $$;
REVOKE ALL ON FUNCTION public._visitante_id(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.registrar_visita(p_visitante text, p_pagina text DEFAULT 'inicio')
RETURNS bigint LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE v text := public._visitante_id(p_visitante);
BEGIN
  IF v IS NOT NULL AND NOT (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')) THEN
    INSERT INTO public.site_visitas (visitante, pagina) VALUES (v, left(coalesce(p_pagina,'inicio'), 40))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN (SELECT count(*) FROM public.site_visitas);
END $$;

CREATE OR REPLACE FUNCTION public.total_visitas()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM public.site_visitas
$$;

CREATE OR REPLACE FUNCTION public.registrar_visualizacao(p_publicacao uuid, p_tipo text, p_visitante text)
RETURNS void LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE v text := public._visitante_id(p_visitante);
BEGIN
  IF v IS NULL OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')) THEN RETURN; END IF;
  IF p_tipo = 'feed' AND NOT EXISTS (SELECT 1 FROM public.novidades WHERE id = p_publicacao AND aprovado AND canal = 'feed') THEN RETURN; END IF;
  IF p_tipo = 'comercio' AND NOT EXISTS (SELECT 1 FROM public.comercios WHERE id = p_publicacao AND aprovado) THEN RETURN; END IF;
  IF p_tipo NOT IN ('feed','comercio') THEN RETURN; END IF;
  INSERT INTO public.publicacao_visualizacoes (publicacao_id, tipo, visitante) VALUES (p_publicacao, p_tipo, v)
  ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.contagem_visualizacoes(p_ids uuid[])
RETURNS TABLE (publicacao_id uuid, total bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT publicacao_id, count(*) FROM public.publicacao_visualizacoes
  WHERE publicacao_id = ANY (p_ids[1:200]) GROUP BY publicacao_id
$$;

CREATE OR REPLACE FUNCTION public.admin_resumo_visitas()
RETURNS TABLE (hoje bigint, ultimos_30 bigint, categoria_top text, categoria_top_total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE d date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'acesso negado'; END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM public.site_visitas WHERE dia = d),
    (SELECT count(*) FROM public.site_visitas WHERE dia > d - 30),
    t.categoria, t.total
  FROM (SELECT NULL::int) x
  LEFT JOIN LATERAL (
    SELECT c.categoria::text AS categoria, count(*) AS total
    FROM public.publicacao_visualizacoes v JOIN public.comercios c ON c.id = v.publicacao_id
    WHERE v.tipo = 'comercio' AND c.categoria IS NOT NULL
    GROUP BY c.categoria ORDER BY count(*) DESC LIMIT 1
  ) t ON true;
END $$;

REVOKE ALL ON FUNCTION public.registrar_visita(text,text), public.total_visitas(), public.registrar_visualizacao(uuid,text,text), public.contagem_visualizacoes(uuid[]), public.admin_resumo_visitas() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_visita(text,text), public.total_visitas(), public.registrar_visualizacao(uuid,text,text), public.contagem_visualizacoes(uuid[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_resumo_visitas() TO authenticated;