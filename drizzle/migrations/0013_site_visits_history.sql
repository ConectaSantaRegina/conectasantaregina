CREATE TABLE public.site_visitas_historico (
  dia date PRIMARY KEY,
  total integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.site_visitas_historico TO service_role;
ALTER TABLE public.site_visitas_historico ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.total_visitas()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT count(*) FROM public.site_visitas WHERE dia >= DATE '2026-09-26')
       + (SELECT coalesce(sum(total),0) FROM public.site_visitas_historico WHERE dia >= DATE '2026-09-26')
$$;

CREATE OR REPLACE FUNCTION public.registrar_visita(p_visitante text, p_pagina text DEFAULT 'inicio')
RETURNS bigint LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE v text := public._visitante_id(p_visitante);
BEGIN
  IF v IS NOT NULL AND NOT (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin')) THEN
    INSERT INTO public.site_visitas (visitante, pagina) VALUES (v, left(coalesce(p_pagina,'inicio'), 40))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN public.total_visitas();
END $$;

CREATE OR REPLACE FUNCTION public.admin_resumo_visitas()
RETURNS TABLE (hoje bigint, ultimos_30 bigint, categoria_top text, categoria_top_total bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE d date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'acesso negado'; END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM public.site_visitas WHERE dia = d) + (SELECT coalesce(sum(h.total),0)::bigint FROM public.site_visitas_historico h WHERE h.dia = d),
    (SELECT count(*) FROM public.site_visitas WHERE dia > d - 30) + (SELECT coalesce(sum(h.total),0)::bigint FROM public.site_visitas_historico h WHERE h.dia > d - 30),
    t.categoria, t.total
  FROM (SELECT NULL::int) x
  LEFT JOIN LATERAL (
    SELECT c.categoria::text AS categoria, count(*) AS total
    FROM public.publicacao_visualizacoes v JOIN public.comercios c ON c.id = v.publicacao_id
    WHERE v.tipo = 'comercio' AND c.categoria IS NOT NULL
    GROUP BY c.categoria ORDER BY count(*) DESC LIMIT 1
  ) t ON true;
END $$;