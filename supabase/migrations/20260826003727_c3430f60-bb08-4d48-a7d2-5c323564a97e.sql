-- 1) Remove anonymous raw read of sugestao_apoios (linked user_id -> activity)
DROP POLICY IF EXISTS "apoios read counts" ON public.sugestao_apoios;
REVOKE SELECT ON public.sugestao_apoios FROM anon;

-- Public aggregate view (no user_id exposed)
CREATE OR REPLACE VIEW public.sugestao_apoios_contagem AS
  SELECT sugestao_id, count(*)::bigint AS total
  FROM public.sugestao_apoios
  GROUP BY sugestao_id;

GRANT SELECT ON public.sugestao_apoios_contagem TO anon, authenticated;

-- 2) Restrict UPDATE on the 'imagens' storage bucket to file owners
DROP POLICY IF EXISTS "imagens update own" ON storage.objects;
CREATE POLICY "imagens update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'imagens' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'imagens' AND owner = auth.uid());