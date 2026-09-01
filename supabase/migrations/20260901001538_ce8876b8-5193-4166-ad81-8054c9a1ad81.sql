CREATE TABLE public.pedidos_destaque (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comercio_id uuid REFERENCES public.comercios(id) ON DELETE SET NULL,
  negocio text NOT NULL,
  contato text NOT NULL,
  mensagem text,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pedidos_destaque_status_check CHECK (status IN ('novo', 'em contato', 'aprovado', 'recusado'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_destaque TO authenticated;
GRANT ALL ON public.pedidos_destaque TO service_role;

ALTER TABLE public.pedidos_destaque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos destaque insert own" ON public.pedidos_destaque
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "pedidos destaque read own or admin" ON public.pedidos_destaque
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pedidos destaque update admin" ON public.pedidos_destaque
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pedidos destaque delete own or admin" ON public.pedidos_destaque
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pedidos_destaque_updated_at
  BEFORE UPDATE ON public.pedidos_destaque
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();