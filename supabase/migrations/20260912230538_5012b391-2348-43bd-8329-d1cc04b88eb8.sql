CREATE OR REPLACE FUNCTION public.novidades_premium_aprovadas(_limite integer DEFAULT 6)
RETURNS TABLE (
  id uuid,
  titulo text,
  texto text,
  categoria text,
  imagem_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    )
  ORDER BY n.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limite, 6), 1), 20)
$$;

REVOKE ALL ON FUNCTION public.novidades_premium_aprovadas(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.novidades_premium_aprovadas(integer) TO anon, authenticated, service_role;