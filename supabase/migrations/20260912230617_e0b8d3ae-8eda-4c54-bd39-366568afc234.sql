DROP VIEW public.destaques_premium;
DROP FUNCTION public.novidades_premium_aprovadas(integer);

ALTER TABLE public.novidades ADD COLUMN premium_valido_ate date;
GRANT SELECT (premium_valido_ate) ON public.novidades TO anon, authenticated;

UPDATE public.novidades AS n
SET premium_valido_ate = (
  SELECT max(p.valido_ate)
  FROM public.premium AS p
  WHERE p.user_id = n.user_id
    AND p.ativo = true
    AND p.valido_ate >= CURRENT_DATE
);

CREATE OR REPLACE FUNCTION public.sincroniza_premium_novidades()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alvo uuid;
BEGIN
  alvo := COALESCE(NEW.user_id, OLD.user_id);

  UPDATE public.novidades AS n
  SET premium_valido_ate = (
    SELECT max(p.valido_ate)
    FROM public.premium AS p
    WHERE p.user_id = alvo
      AND p.ativo = true
      AND p.valido_ate >= CURRENT_DATE
  )
  WHERE n.user_id = alvo;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.sincroniza_premium_novidades() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sincroniza_premium_novidades() TO service_role;

CREATE TRIGGER premium_sincroniza_novidades
AFTER INSERT OR UPDATE OR DELETE ON public.premium
FOR EACH ROW EXECUTE FUNCTION public.sincroniza_premium_novidades();

CREATE OR REPLACE FUNCTION public.novidades_define_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT max(p.valido_ate)
    INTO NEW.premium_valido_ate
  FROM public.premium AS p
  WHERE p.user_id = NEW.user_id
    AND p.ativo = true
    AND p.valido_ate >= CURRENT_DATE;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.novidades_define_premium() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.novidades_define_premium() TO service_role;

CREATE TRIGGER novidades_define_premium
BEFORE INSERT OR UPDATE ON public.novidades
FOR EACH ROW EXECUTE FUNCTION public.novidades_define_premium();