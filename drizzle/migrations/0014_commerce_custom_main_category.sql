ALTER TABLE public.comercios ADD COLUMN categoria_principal_personalizada text;

CREATE OR REPLACE FUNCTION public.validar_categoria_principal_personalizada() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.categoria_principal_personalizada IS NOT NULL THEN
  NEW.categoria_principal_personalizada := regexp_replace(btrim(NEW.categoria_principal_personalizada), '\s+', ' ', 'g');
  IF length(NEW.categoria_principal_personalizada)<2 OR length(NEW.categoria_principal_personalizada)>100 THEN RAISE EXCEPTION 'A categoria principal deve ter entre 2 e 100 caracteres.'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validar_categoria_principal_personalizada BEFORE INSERT OR UPDATE ON public.comercios FOR EACH ROW EXECUTE FUNCTION public.validar_categoria_principal_personalizada();

CREATE OR REPLACE FUNCTION public.aprovar_categoria_principal_personalizada() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE principal_id uuid;
BEGIN
 IF NEW.aprovado AND NOT OLD.aprovado AND NEW.categoria_principal_personalizada IS NOT NULL THEN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Apenas administradores podem aprovar.'; END IF;
  SELECT id INTO principal_id FROM public.comercio_categorias WHERE categoria_pai_id IS NULL AND chave=public.normalizar_categoria_comercio(NEW.categoria_principal_personalizada);
  IF principal_id IS NULL THEN
   INSERT INTO public.comercio_categorias(nome,chave,status) VALUES(NEW.categoria_principal_personalizada,public.normalizar_categoria_comercio(NEW.categoria_principal_personalizada),'aprovado') RETURNING id INTO principal_id;
  ELSE UPDATE public.comercio_categorias SET status='aprovado' WHERE id=principal_id;
  END IF;
  NEW.categoria_principal_id := principal_id;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER aprovar_categoria_principal_personalizada BEFORE UPDATE OF aprovado ON public.comercios FOR EACH ROW EXECUTE FUNCTION public.aprovar_categoria_principal_personalizada();

CREATE OR REPLACE FUNCTION public.salvar_comercio_classificado(p_dados jsonb, p_categoria uuid, p_subcategorias uuid[], p_id uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SET search_path=public AS $$
DECLARE v_id uuid; v_nome text; v_sub text; v_row public.comercios; v_principal uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta para publicar.'; END IF;
 v_row := jsonb_populate_record(NULL::public.comercios,p_dados);
 v_row.categoria_principal_personalizada := NULLIF(regexp_replace(btrim(v_row.categoria_principal_personalizada),'\s+',' ','g'),'');
 IF v_row.categoria_principal_personalizada IS NOT NULL THEN
  IF length(v_row.categoria_principal_personalizada)<2 OR length(v_row.categoria_principal_personalizada)>100 THEN RAISE EXCEPTION 'A categoria principal deve ter entre 2 e 100 caracteres.'; END IF;
  IF COALESCE(cardinality(p_subcategorias),0)>0 THEN RAISE EXCEPTION 'Informe subcategorias personalizadas para a nova categoria principal.'; END IF;
  v_principal := NULL;
 ELSE
  SELECT id,nome INTO v_principal,v_nome FROM public.comercio_categorias WHERE id=p_categoria AND categoria_pai_id IS NULL AND status='aprovado';
  IF v_principal IS NULL THEN RAISE EXCEPTION 'Selecione uma categoria principal válida.'; END IF;
 END IF;
 v_row.subcategorias_personalizadas := COALESCE(v_row.subcategorias_personalizadas,ARRAY[]::text[]);
 IF COALESCE(cardinality(p_subcategorias),0)+cardinality(v_row.subcategorias_personalizadas)<1 OR COALESCE(cardinality(p_subcategorias),0)+cardinality(v_row.subcategorias_personalizadas)>20 THEN RAISE EXCEPTION 'Selecione entre uma e vinte subcategorias.'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(v_row.subcategorias_personalizadas) n WHERE n IS NULL OR length(btrim(n))<2 OR length(n)>100) THEN RAISE EXCEPTION 'Cada subcategoria deve ter entre 2 e 100 caracteres.'; END IF;
 SELECT COALESCE(array_agg(nome ORDER BY nome),ARRAY[]::text[]) INTO v_row.subcategorias_personalizadas FROM (SELECT DISTINCT btrim(n) AS nome FROM unnest(v_row.subcategorias_personalizadas) n) nomes;
 IF EXISTS(SELECT 1 FROM unnest(p_subcategorias) s(id) WHERE s.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.comercio_categorias t WHERE t.id=s.id AND t.categoria_pai_id=v_principal AND t.status='aprovado')) THEN RAISE EXCEPTION 'Selecione subcategorias da categoria principal.'; END IF;
 SELECT nome INTO v_sub FROM public.comercio_categorias WHERE id=p_subcategorias[1];
 v_sub := COALESCE(v_sub,v_row.subcategorias_personalizadas[1]);
 IF length(btrim(COALESCE(v_row.nome,'')))<2 OR length(v_row.nome)>200 OR length(COALESCE(v_row.descricao,''))>4000 OR length(COALESCE(v_row.endereco,''))>4000 OR length(COALESCE(v_row.horario,''))>400 THEN RAISE EXCEPTION 'Verifique os dados do comércio.'; END IF;
 IF p_id IS NULL THEN
  INSERT INTO public.comercios(user_id,nome,categoria,categoria_principal_id,categoria_principal_personalizada,secao,descricao,endereco,telefone,whatsapp,instagram,horario,delivery,imagem_url,fotos_extras,subcategorias_personalizadas)
  VALUES(auth.uid(),btrim(v_row.nome),v_sub,v_principal,v_row.categoria_principal_personalizada,'comercio',v_row.descricao,v_row.endereco,v_row.telefone,v_row.whatsapp,v_row.instagram,v_row.horario,COALESCE(v_row.delivery,false),v_row.imagem_url,COALESCE(v_row.fotos_extras,ARRAY[]::text[]),v_row.subcategorias_personalizadas) RETURNING id INTO v_id;
 ELSE
  UPDATE public.comercios SET nome=btrim(v_row.nome),categoria=v_sub,categoria_principal_id=v_principal,categoria_principal_personalizada=v_row.categoria_principal_personalizada,secao='comercio',descricao=v_row.descricao,endereco=v_row.endereco,telefone=v_row.telefone,whatsapp=v_row.whatsapp,instagram=v_row.instagram,horario=v_row.horario,delivery=COALESCE(v_row.delivery,false),imagem_url=CASE WHEN p_dados ? 'imagem_url' THEN v_row.imagem_url ELSE imagem_url END,fotos_extras=CASE WHEN p_dados ? 'fotos_extras' THEN v_row.fotos_extras ELSE fotos_extras END,subcategorias_personalizadas=v_row.subcategorias_personalizadas,aprovado=false WHERE id=p_id RETURNING id INTO v_id;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Cadastro não encontrado ou sem permissão.'; END IF;
  DELETE FROM public.comercio_subcategorias WHERE comercio_id=v_id;
 END IF;
 INSERT INTO public.comercio_subcategorias(comercio_id,subcategoria_id) SELECT v_id,id FROM (SELECT DISTINCT unnest(p_subcategorias) AS id) s;
 RETURN v_id;
END; $$;