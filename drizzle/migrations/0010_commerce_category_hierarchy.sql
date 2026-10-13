CREATE TABLE public.comercio_categorias (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nome text NOT NULL,
 chave text NOT NULL,
 categoria_pai_id uuid REFERENCES public.comercio_categorias(id),
 status text NOT NULL DEFAULT 'pendente',
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT comercio_categorias_status CHECK (status IN ('pendente', 'aprovado'))
);
GRANT SELECT (id,nome,chave,categoria_pai_id,status) ON public.comercio_categorias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comercio_categorias TO authenticated;
GRANT ALL ON public.comercio_categorias TO service_role;
ALTER TABLE public.comercio_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taxonomy approved public" ON public.comercio_categorias FOR SELECT TO anon, authenticated USING (status = 'aprovado');
CREATE POLICY "taxonomy admin manage" ON public.comercio_categorias FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE UNIQUE INDEX comercio_categorias_main_key ON public.comercio_categorias(chave) WHERE categoria_pai_id IS NULL;
CREATE UNIQUE INDEX comercio_categorias_child_key ON public.comercio_categorias(categoria_pai_id, chave) WHERE categoria_pai_id IS NOT NULL;
CREATE FUNCTION public.normalizar_categoria_comercio(valor text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT regexp_replace(lower(translate(trim(valor), 'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç', 'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc')), '\s+', ' ', 'g')
$$;
CREATE FUNCTION public.validar_categoria_comercio() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 NEW.nome := regexp_replace(trim(NEW.nome), '\s+', ' ', 'g');
 IF length(NEW.nome) < 2 OR length(NEW.nome) > 100 THEN RAISE EXCEPTION 'Informe uma categoria entre 2 e 100 caracteres.'; END IF;
 NEW.chave := public.normalizar_categoria_comercio(NEW.nome);
 IF NEW.categoria_pai_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.comercio_categorias WHERE id = NEW.categoria_pai_id AND categoria_pai_id IS NULL AND id <> NEW.id) THEN RAISE EXCEPTION 'Subcategorias precisam de uma categoria principal.'; END IF;
 IF TG_OP = 'UPDATE' AND NEW.categoria_pai_id IS DISTINCT FROM OLD.categoria_pai_id AND EXISTS (SELECT 1 FROM public.comercio_categorias WHERE categoria_pai_id = NEW.id) THEN RAISE EXCEPTION 'Uma categoria com subcategorias não pode mudar de nível.'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validar_categoria_comercio BEFORE INSERT OR UPDATE ON public.comercio_categorias FOR EACH ROW EXECUTE FUNCTION public.validar_categoria_comercio();
ALTER TABLE public.comercios ADD COLUMN categoria_principal_id uuid REFERENCES public.comercio_categorias(id);
GRANT SELECT (categoria_principal_id) ON public.comercios TO anon;
CREATE TABLE public.comercio_subcategorias (
 comercio_id uuid NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
 subcategoria_id uuid NOT NULL REFERENCES public.comercio_categorias(id),
 PRIMARY KEY (comercio_id, subcategoria_id)
);
GRANT SELECT ON public.comercio_subcategorias TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comercio_subcategorias TO authenticated;
GRANT ALL ON public.comercio_subcategorias TO service_role;
ALTER TABLE public.comercio_subcategorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commerce subcategories public" ON public.comercio_subcategorias FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.comercios c WHERE c.id = comercio_id AND c.aprovado) AND EXISTS (SELECT 1 FROM public.comercio_categorias t WHERE t.id = subcategoria_id AND t.status = 'aprovado'));
CREATE POLICY "commerce subcategories own read" ON public.comercio_subcategorias FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.comercios c WHERE c.id = comercio_id AND c.user_id = auth.uid()));
CREATE POLICY "commerce subcategories admin" ON public.comercio_subcategorias FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.validar_subcategoria_comercio() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.comercios c JOIN public.comercio_categorias t ON t.categoria_pai_id = c.categoria_principal_id WHERE c.id = NEW.comercio_id AND t.id = NEW.subcategoria_id) THEN RAISE EXCEPTION 'A subcategoria deve pertencer à categoria principal do comércio.'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validar_subcategoria_comercio BEFORE INSERT OR UPDATE ON public.comercio_subcategorias FOR EACH ROW EXECUTE FUNCTION public.validar_subcategoria_comercio();