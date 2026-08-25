DROP FUNCTION IF EXISTS public.contar_apoios();

CREATE VIEW public.apoios_totais
WITH (security_invoker = off) AS
  SELECT sugestao_id, count(*)::bigint AS total
  FROM public.sugestao_apoios
  GROUP BY sugestao_id;

GRANT SELECT ON public.apoios_totais TO anon, authenticated;