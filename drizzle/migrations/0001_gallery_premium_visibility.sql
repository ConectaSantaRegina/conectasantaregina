CREATE OR REPLACE FUNCTION public.comercios_galeria_premium() RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT c.id FROM public.comercios c JOIN public.premium p ON ((p.comercio_id = c.id) OR (p.comercio_id IS NULL AND p.user_id = c.user_id)) WHERE p.ativo = true AND p.valido_ate >= CURRENT_DATE;
$$;
REVOKE ALL ON FUNCTION public.comercios_galeria_premium() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comercios_galeria_premium() TO anon, authenticated, service_role;