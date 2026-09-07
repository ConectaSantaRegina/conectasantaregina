-- 1) Aprovação de novidades
ALTER TABLE public.novidades
  ADD COLUMN IF NOT EXISTS aprovado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS aprovado_em timestamptz,
  ADD COLUMN IF NOT EXISTS aprovado_por uuid;

-- registros existentes continuam visíveis
UPDATE public.novidades SET aprovado = true, aprovado_em = now() WHERE aprovado = false;

GRANT SELECT (id, titulo, texto, categoria, imagem_url, aprovado, created_at, updated_at)
  ON public.novidades TO anon;

-- leitura: público só vê aprovadas; autor vê as suas; admin vê todas
DROP POLICY IF EXISTS "novidades public read" ON public.novidades;
CREATE POLICY "novidades read aprovadas" ON public.novidades
  FOR SELECT TO anon, authenticated
  USING (aprovado);
CREATE POLICY "novidades read own or admin" ON public.novidades
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- criar novidade exige Premium ativo (ou ser admin)
DROP POLICY IF EXISTS "novidades insert own" ON public.novidades;
CREATE POLICY "novidades insert premium" ON public.novidades
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (public.premium_ativo(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  );

-- só admin define aprovação; edição do autor volta para a fila
CREATE OR REPLACE FUNCTION public.novidades_controla_aprovacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    IF NEW.aprovado AND (TG_OP = 'INSERT' OR NOT COALESCE(OLD.aprovado, false)) THEN
      NEW.aprovado_em := now();
      NEW.aprovado_por := auth.uid();
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.aprovado := false;
    NEW.aprovado_em := NULL;
    NEW.aprovado_por := NULL;
  ELSE
    NEW.aprovado := false;
    NEW.aprovado_em := NULL;
    NEW.aprovado_por := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS novidades_aprovacao ON public.novidades;
CREATE TRIGGER novidades_aprovacao
  BEFORE INSERT OR UPDATE ON public.novidades
  FOR EACH ROW EXECUTE FUNCTION public.novidades_controla_aprovacao();

-- 2) Premium por usuário (sem comércio ligado)
CREATE UNIQUE INDEX IF NOT EXISTS premium_usuario_unico
  ON public.premium (user_id) WHERE comercio_id IS NULL;

-- 3) Consulta de Premium ativo do próprio usuário
CREATE OR REPLACE FUNCTION public.meu_premium_ativo()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.premium_ativo(auth.uid())
$$;

REVOKE ALL ON FUNCTION public.meu_premium_ativo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.meu_premium_ativo() TO authenticated, service_role;