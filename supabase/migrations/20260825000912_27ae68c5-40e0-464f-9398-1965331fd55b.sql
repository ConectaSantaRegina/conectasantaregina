DROP VIEW IF EXISTS public.apoios_totais;

-- Anonymous visitors may count supports per suggestion, but only see the suggestion reference
CREATE POLICY "apoios read counts" ON public.sugestao_apoios FOR SELECT TO anon USING (true);
GRANT SELECT (sugestao_id) ON public.sugestao_apoios TO anon;