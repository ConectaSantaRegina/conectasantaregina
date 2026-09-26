ALTER TABLE public.comercios ADD COLUMN IF NOT EXISTS fotos_extras text[] NOT NULL DEFAULT '{}';
GRANT SELECT (fotos_extras) ON public.comercios TO anon;
CREATE OR REPLACE FUNCTION public.validar_fotos_comercio() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
  IF cardinality(NEW.fotos_extras) > 5 THEN RAISE EXCEPTION 'O limite é de cinco fotos extras.'; END IF;
  IF cardinality(NEW.fotos_extras) > 0 AND NOT (public.premium_ativo(NEW.user_id) OR public.has_role(auth.uid(), 'admin')) THEN RAISE EXCEPTION 'Fotos extras exigem uma conta Premium ativa.'; END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validar_fotos_comercio() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validar_fotos_comercio BEFORE INSERT OR UPDATE OF fotos_extras ON public.comercios FOR EACH ROW EXECUTE FUNCTION public.validar_fotos_comercio();