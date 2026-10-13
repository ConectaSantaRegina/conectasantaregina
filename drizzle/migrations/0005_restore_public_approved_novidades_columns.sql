-- Restore public reading while keeping author and moderator identifiers private.
GRANT SELECT ON public.novidades TO anon;
REVOKE SELECT ON public.novidades FROM anon;
GRANT SELECT (id, titulo, texto, categoria, imagem_url, created_at, updated_at, aprovado, premium_valido_ate, canal) ON public.novidades TO anon;
-- Existing RLS limits visitors to approved rows; no write privileges are added.
