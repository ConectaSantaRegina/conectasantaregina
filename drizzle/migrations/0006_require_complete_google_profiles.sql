ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cadastro_completo_em timestamptz;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
CREATE OR REPLACE FUNCTION public.validar_cadastro_perfil() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.cadastro_completo_em IS NOT NULL THEN
    NEW.nome := btrim(NEW.nome);
    NEW.whatsapp := regexp_replace(COALESCE(NEW.whatsapp, ''), '[^0-9]', '', 'g');
    IF length(NEW.nome) < 5 OR length(NEW.nome) > 120 OR NEW.nome !~ '^[^[:space:]]+[[:space:]]+[^[:space:]]+' THEN RAISE EXCEPTION 'Informe nome e sobrenome.'; END IF;
    IF NEW.whatsapp !~ '^([1-9][0-9]{9,10}|55[1-9][0-9]{9,10})$' THEN RAISE EXCEPTION 'Informe um WhatsApp válido com DDD.'; END IF;
    IF NEW.morador IS NULL THEN RAISE EXCEPTION 'Informe se você mora no bairro.'; END IF;
    NEW.cadastro_completo_em := COALESCE(OLD.cadastro_completo_em, now());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER validar_cadastro_perfil BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validar_cadastro_perfil();
CREATE OR REPLACE FUNCTION public.exigir_perfil_completo() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.user_id AND p.cadastro_completo_em IS NOT NULL) THEN RAISE EXCEPTION 'Complete seu cadastro com nome, WhatsApp e informação de moradia antes de publicar.'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER exigir_perfil_completo BEFORE INSERT ON public.comercios FOR EACH ROW EXECUTE FUNCTION public.exigir_perfil_completo();
CREATE TRIGGER exigir_perfil_completo BEFORE INSERT ON public.vagas FOR EACH ROW EXECUTE FUNCTION public.exigir_perfil_completo();
CREATE TRIGGER exigir_perfil_completo BEFORE INSERT ON public.imoveis FOR EACH ROW EXECUTE FUNCTION public.exigir_perfil_completo();
CREATE TRIGGER exigir_perfil_completo BEFORE INSERT ON public.acoes FOR EACH ROW EXECUTE FUNCTION public.exigir_perfil_completo();
CREATE TRIGGER exigir_perfil_completo BEFORE INSERT ON public.novidades FOR EACH ROW EXECUTE FUNCTION public.exigir_perfil_completo();