-- 1. profiles: no more public read
DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;
CREATE POLICY "profiles read own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

-- 2. content tables: hide creator user_id from anonymous visitors via column grants
REVOKE SELECT ON public.acoes, public.comercios, public.imoveis, public.novidades, public.sugestoes, public.vagas FROM anon;
GRANT SELECT (id, titulo, tipo, descricao, meta, local, contato, imagem_url, created_at, updated_at) ON public.acoes TO anon;
GRANT SELECT (id, nome, categoria, descricao, endereco, telefone, whatsapp, instagram, horario, delivery, imagem_url, created_at, updated_at) ON public.comercios TO anon;
GRANT SELECT (id, titulo, finalidade, tipo, preco, endereco, descricao, contato, imagem_url, created_at, updated_at) ON public.imoveis TO anon;
GRANT SELECT (id, titulo, texto, categoria, imagem_url, created_at, updated_at) ON public.novidades TO anon;
GRANT SELECT (id, titulo, descricao, local, status, created_at, updated_at) ON public.sugestoes TO anon;
GRANT SELECT (id, titulo, empresa, descricao, tipo, salario, contato, created_at, updated_at) ON public.vagas TO anon;

-- 3. sugestao_apoios: no anonymous read of who supported what; anonymous only sees aggregate counts
DROP POLICY IF EXISTS "apoios public read" ON public.sugestao_apoios;
REVOKE SELECT ON public.sugestao_apoios FROM anon;
CREATE POLICY "apoios read authenticated" ON public.sugestao_apoios FOR SELECT TO authenticated USING (true);
CREATE POLICY "apoios delete admin" ON public.sugestao_apoios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.contar_apoios()
RETURNS TABLE (sugestao_id uuid, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sugestao_id, count(*)::bigint FROM public.sugestao_apoios GROUP BY sugestao_id
$$;
REVOKE ALL ON FUNCTION public.contar_apoios() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contar_apoios() TO anon, authenticated;