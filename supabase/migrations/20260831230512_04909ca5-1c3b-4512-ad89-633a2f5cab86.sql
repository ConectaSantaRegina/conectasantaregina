ALTER TABLE public.comercios
  ADD COLUMN IF NOT EXISTS secao text NOT NULL DEFAULT 'comercio';

ALTER TABLE public.comercios
  ADD CONSTRAINT comercios_secao_check CHECK (secao IN ('comercio', 'publico'));

UPDATE public.comercios
SET secao = 'publico'
WHERE categoria IN (
  'Escola', 'Posto de Saúde', 'UBS', 'Subprefeitura', 'Praça', 'Biblioteca',
  'Centro Esportivo', 'Creche', 'Outra estrutura pública'
);

GRANT SELECT (secao) ON public.comercios TO anon;