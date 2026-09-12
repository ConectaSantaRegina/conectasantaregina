REVOKE EXECUTE ON FUNCTION public.novidades_premium_aprovadas(integer) FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE VIEW public.destaques_premium
WITH (security_barrier = true)
AS
SELECT n.id, n.titulo, n.texto, n.categoria, n.imagem_url, n.created_at, n.updated_at
FROM public.novidades AS n
WHERE n.aprovado = true
  AND n.imagem_url IS NOT NULL
  AND btrim(n.imagem_url) <> ''
  AND EXISTS (
    SELECT 1
    FROM public.premium AS p
    WHERE p.user_id = n.user_id
      AND p.ativo = true
      AND p.valido_ate >= CURRENT_DATE
  );

REVOKE ALL ON public.destaques_premium FROM PUBLIC;
GRANT SELECT ON public.destaques_premium TO anon, authenticated, service_role;