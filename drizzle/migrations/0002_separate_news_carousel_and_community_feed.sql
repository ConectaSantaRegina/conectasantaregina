ALTER TABLE public.novidades
  ADD COLUMN canal text NOT NULL DEFAULT 'novidades';

ALTER TABLE public.novidades
  ADD CONSTRAINT novidades_canal_valido CHECK (canal IN ('novidades', 'feed'));

COMMENT ON COLUMN public.novidades.canal IS 'Destino de exibição: novidades no carrossel/página ou feed comunitário.';

CREATE INDEX novidades_canal_aprovado_created_at_idx
  ON public.novidades (canal, aprovado, created_at DESC);