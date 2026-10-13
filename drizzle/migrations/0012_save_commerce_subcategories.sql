GRANT INSERT, DELETE ON public.comercio_subcategorias TO authenticated;
CREATE POLICY "commerce subcategories own insert" ON public.comercio_subcategorias FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.comercios c WHERE c.id = comercio_id AND c.user_id = auth.uid() AND NOT c.aprovado));
CREATE POLICY "commerce subcategories own delete" ON public.comercio_subcategorias FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.comercios c WHERE c.id = comercio_id AND c.user_id = auth.uid() AND NOT c.aprovado));
CREATE OR REPLACE FUNCTION public.salvar_comercio_classificado(p_dados jsonb, p_categoria uuid, p_subcategorias uuid[], p_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE v_id uuid; v_nome text; v_sub text; v_row public.comercios;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta para publicar.'; END IF;
 SELECT nome INTO v_nome FROM public.comercio_categorias WHERE id=p_categoria AND categoria_pai_id IS NULL AND status='aprovado';
 IF v_nome IS NULL THEN RAISE EXCEPTION 'Selecione uma categoria principal válida.'; END IF;
 IF COALESCE(cardinality(p_subcategorias),0) < 1 OR cardinality(p_subcategorias)>20 THEN RAISE EXCEPTION 'Selecione entre uma e vinte subcategorias.'; END IF;
 IF EXISTS (SELECT 1 FROM unnest(p_subcategorias) s(id) WHERE s.id IS NULL OR NOT EXISTS (SELECT 1 FROM public.comercio_categorias t WHERE t.id=s.id AND t.categoria_pai_id=p_categoria AND t.status='aprovado')) THEN RAISE EXCEPTION 'Selecione subcategorias da categoria principal.'; END IF;
 SELECT nome INTO v_sub FROM public.comercio_categorias WHERE id=p_subcategorias[1];
 v_row := jsonb_populate_record(NULL::public.comercios, p_dados);
 IF length(btrim(COALESCE(v_row.nome,'')))<2 OR length(v_row.nome)>200 OR length(COALESCE(v_row.descricao,''))>4000 OR length(COALESCE(v_row.endereco,''))>4000 OR length(COALESCE(v_row.horario,''))>400 THEN RAISE EXCEPTION 'Verifique os dados do comércio.'; END IF;
 IF p_id IS NULL THEN
 INSERT INTO public.comercios(user_id,nome,categoria,categoria_principal_id,secao,descricao,endereco,telefone,whatsapp,instagram,horario,delivery,imagem_url,fotos_extras)
 VALUES(auth.uid(),btrim(v_row.nome),v_sub,p_categoria,'comercio',v_row.descricao,v_row.endereco,v_row.telefone,v_row.whatsapp,v_row.instagram,v_row.horario,COALESCE(v_row.delivery,false),v_row.imagem_url,COALESCE(v_row.fotos_extras,ARRAY[]::text[])) RETURNING id INTO v_id;
 ELSE
 UPDATE public.comercios SET nome=btrim(v_row.nome),categoria=v_sub,categoria_principal_id=p_categoria,secao='comercio',descricao=v_row.descricao,endereco=v_row.endereco,telefone=v_row.telefone,whatsapp=v_row.whatsapp,instagram=v_row.instagram,horario=v_row.horario,delivery=COALESCE(v_row.delivery,false),imagem_url=CASE WHEN p_dados ? 'imagem_url' THEN v_row.imagem_url ELSE imagem_url END,fotos_extras=CASE WHEN p_dados ? 'fotos_extras' THEN v_row.fotos_extras ELSE fotos_extras END,aprovado=false WHERE id=p_id RETURNING id INTO v_id;
 IF v_id IS NULL THEN RAISE EXCEPTION 'Cadastro não encontrado ou sem permissão.'; END IF;
 DELETE FROM public.comercio_subcategorias WHERE comercio_id=v_id;
 END IF;
 INSERT INTO public.comercio_subcategorias(comercio_id,subcategoria_id) SELECT v_id,id FROM (SELECT DISTINCT unnest(p_subcategorias) AS id) s;
 RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.salvar_comercio_classificado(jsonb,uuid,uuid[],uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.salvar_comercio_classificado(jsonb,uuid,uuid[],uuid) TO authenticated, service_role;