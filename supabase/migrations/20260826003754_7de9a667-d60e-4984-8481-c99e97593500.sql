DROP VIEW IF EXISTS public.sugestao_apoios_contagem;

-- Anon may only read the sugestao_id column (for counting), never user_id
CREATE POLICY "apoios read counts" ON public.sugestao_apoios
  FOR SELECT TO anon USING (true);

REVOKE SELECT ON public.sugestao_apoios FROM anon;
GRANT SELECT (sugestao_id) ON public.sugestao_apoios TO anon;