ALTER TABLE public.comercios ADD COLUMN aprovado boolean NOT NULL DEFAULT false;
ALTER TABLE public.vagas ADD COLUMN aprovado boolean NOT NULL DEFAULT false;
ALTER TABLE public.imoveis ADD COLUMN aprovado boolean NOT NULL DEFAULT false;
ALTER TABLE public.sugestoes ADD COLUMN aprovado boolean NOT NULL DEFAULT false;
ALTER TABLE public.acoes ADD COLUMN aprovado boolean NOT NULL DEFAULT false;

-- Preserve publications already visible before moderation was introduced.
UPDATE public.comercios SET aprovado = true;
UPDATE public.vagas SET aprovado = true;
UPDATE public.imoveis SET aprovado = true;
UPDATE public.sugestoes SET aprovado = true;
UPDATE public.acoes SET aprovado = true;

CREATE OR REPLACE FUNCTION public.controlar_aprovacao_publicacao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.aprovado := false;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.controlar_aprovacao_publicacao() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.controlar_aprovacao_publicacao() TO service_role;

DO $$
DECLARE tabela text;
BEGIN
  FOREACH tabela IN ARRAY ARRAY['comercios','vagas','imoveis','sugestoes','acoes'] LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', tabela || ' public read', tabela);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (aprovado)', tabela || ' read approved', tabela);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), ''admin''::public.app_role))', tabela || ' read own or admin', tabela);
    EXECUTE format('CREATE TRIGGER controlar_aprovacao BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.controlar_aprovacao_publicacao()', tabela);
  END LOOP;
END $$;