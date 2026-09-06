CREATE TABLE public.premium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comercio_id uuid REFERENCES public.comercios(id) ON DELETE CASCADE,
  valido_ate date NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX premium_comercio_unico ON public.premium (comercio_id) WHERE comercio_id IS NOT NULL;
CREATE INDEX premium_user_idx ON public.premium (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.premium TO authenticated;
GRANT ALL ON public.premium TO service_role;
GRANT SELECT (id, comercio_id, valido_ate, ativo) ON public.premium TO anon;

ALTER TABLE public.premium ENABLE ROW LEVEL SECURITY;

CREATE POLICY "premium admin manage" ON public.premium FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "premium read own" ON public.premium FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "premium read ativos" ON public.premium FOR SELECT TO anon
  USING (ativo AND valido_ate >= CURRENT_DATE);

CREATE TRIGGER premium_updated_at BEFORE UPDATE ON public.premium
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.premium_ativo(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.premium
    WHERE user_id = _user_id AND ativo AND valido_ate >= CURRENT_DATE
  )
$$;

REVOKE ALL ON FUNCTION public.premium_ativo(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.premium_ativo(uuid) TO authenticated, anon, service_role;

CREATE POLICY "profiles admin read" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));