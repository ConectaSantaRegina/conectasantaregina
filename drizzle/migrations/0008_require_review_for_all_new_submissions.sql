CREATE OR REPLACE FUNCTION public.controlar_aprovacao_publicacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.aprovado := false;
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.aprovado := false;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.controlar_aprovacao_publicacao() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.controlar_aprovacao_publicacao() TO service_role;

CREATE OR REPLACE FUNCTION public.novidades_controla_aprovacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.aprovado := false;
    NEW.aprovado_em := NULL;
    NEW.aprovado_por := NULL;
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF NEW.aprovado AND NOT COALESCE(OLD.aprovado, false) THEN
      NEW.aprovado_em := now();
      NEW.aprovado_por := auth.uid();
    END IF;
    RETURN NEW;
  END IF;
  NEW.aprovado := false;
  NEW.aprovado_em := NULL;
  NEW.aprovado_por := NULL;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.novidades_controla_aprovacao() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.novidades_controla_aprovacao() TO service_role;